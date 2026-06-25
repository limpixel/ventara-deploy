import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL

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