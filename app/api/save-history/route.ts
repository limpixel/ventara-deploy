import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL || "http://127.0.0.1:5000";

export async function POST(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username") || "";
  const body = await req.json();
  const res = await fetch(`${PYTHON_API}/save_history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Username": username,  // ← tambah
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}