import { NextRequest, NextResponse } from "next/server";
import { PYTHON_API } from "../_config";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username") || "";

  const res = await fetch(`${PYTHON_API}/snapshots`, {
    cache: "no-store",
    headers: {
      "X-Username": username,
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}