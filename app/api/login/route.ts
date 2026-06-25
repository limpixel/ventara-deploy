import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${PYTHON_API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // DEBUG: log dulu sebelum parse
  const text = await res.text();
  console.log("Flask status:", res.status);
  console.log("Flask content-type:", res.headers.get("content-type"));
  console.log("Flask body:", text.slice(0, 300));

  // Parse hanya kalau JSON
  if (!res.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { error: "Flask error", detail: text.slice(0, 200) },
      { status: 502 },
    );
  }

  const data = JSON.parse(text);
  const response = NextResponse.json(data, { status: res.status });
  const setCookies = res.headers.getSetCookie();
  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}
