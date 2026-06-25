import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const res = await fetch(`${PYTHON_API}/users`, {
    headers: { cookie },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}