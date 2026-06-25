import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${PYTHON_API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  // Forward Set-Cookie dari Flask ke browser.
  // PENTING: res.headers.get("set-cookie") SELALU balikin null — itu batasan
  // Fetch API spec (Set-Cookie gak bisa diakses lewat .get() biasa), BUKAN
  // soal Flask gak ngirim cookie-nya. Harus pakai getSetCookie() yang
  // balikin array string, baru di-append satu-satu ke response.
  const response = NextResponse.json(data, { status: res.status });
  const setCookies = res.headers.getSetCookie();
  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}