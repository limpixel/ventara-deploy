import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL;

export async function GET(req: NextRequest) {
  const username = req.headers.get("X-Username") || "";

  const res = await fetch(`${PYTHON_API}/overfit_metrics`, {
    cache: "no-store",
    headers: {
      "X-Username": username,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Flask error:", text);
    return NextResponse.json(
      { error: "Flask error", detail: text },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}