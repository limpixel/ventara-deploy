import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL;

export async function GET(req: NextRequest) {
  const username = req.headers.get("x-username") ?? "";

  const res = await fetch(`${PYTHON_API}/eda_summary`, {
    cache: "no-store",
    headers: { "X-Username": username },
  });

  const data = await res.json();
  return NextResponse.json(data);
}