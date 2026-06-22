import { NextRequest, NextResponse } from "next/server";
import { PYTHON_API } from "../_config";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${PYTHON_API}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Backend returned non-JSON response",
        _debug: { status: res.status, body: text.slice(0, 300) },
      },
      { status: 502 }
    );
  }

  const response = NextResponse.json(data, { status: res.status });
  const setCookies = res.headers.getSetCookie();
  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}