import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL || process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:5000";

export async function POST(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || "";

    const res = await fetch(`${PYTHON_API}/clear_train_progress`, {
      method: "POST",
      headers: { Cookie: cookie },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Flask error", status: res.status }, { status: res.status });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: true });
  }
}
