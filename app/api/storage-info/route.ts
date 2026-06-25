import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { PYTHON_API } from "../_config";

const PAYMENTS_DIR = process.env.VERCEL ? path.join("/tmp", "payments") : path.join(process.cwd(), "data", "payments");

const TIER_ORDER: Record<string, number> = {
  free: 0,
  basic: 1,
  business: 2,
};

async function readPayments(username: string): Promise<any[]> {
  try {
    const raw = await fs.readFile(
      path.join(PAYMENTS_DIR, `${username}.json`),
      "utf-8"
    );
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function upgradeUserTier(username: string, tier: string): Promise<boolean> {
  try {
    const res = await fetch(`${PYTHON_API}/upgrade_tier`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Username": username,
      },
      body: JSON.stringify({ tier }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function getCurrentTier(username: string): Promise<string> {
  try {
    const res = await fetch(`${PYTHON_API}/storage_info`, {
      cache: "no-store",
      headers: { "X-Username": username },
    });
    if (!res.ok) return "free";
    const data = await res.json();
    return data.tier || "free";
  } catch {
    return "free";
  }
}

async function reconcilePayments(username: string): Promise<void> {
  const payments = await readPayments(username);
  const settled = payments
    .filter((p: any) => p.status === "settled" && p.tier)
    .sort(
      (a: any, b: any) =>
        new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()
    );

  if (settled.length === 0) return;

  const currentRank = TIER_ORDER[await getCurrentTier(username)] ?? 0;

  let bestRank = currentRank;
  for (const p of settled) {
    const rank = TIER_ORDER[p.tier] ?? 0;
    if (rank > bestRank) {
      bestRank = rank;
    }
  }

  if (bestRank > currentRank) {
    const bestTier = Object.entries(TIER_ORDER).find(
      ([, v]) => v === bestRank
    )?.[0];
    if (bestTier) {
      await upgradeUserTier(username, bestTier);
    }
  }
}

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username") || "";

  if (!username) {
    return NextResponse.json(
      { success: false, error: "Username is required" },
      { status: 400 }
    );
  }

  try {
    await reconcilePayments(username);

    const res = await fetch(`${PYTHON_API}/storage_info`, {
      cache: "no-store",
      headers: {
        "X-Username": username,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch storage info" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Storage info fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
