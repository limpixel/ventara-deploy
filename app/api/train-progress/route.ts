import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const username = req.nextUrl.searchParams.get("username") || "";

  const res = await fetch(
    `${PYTHON_API}/train_progress?username=${username}`,
    {
      method: "GET",
      headers: { Cookie: cookie },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Flask error", status: res.status }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}