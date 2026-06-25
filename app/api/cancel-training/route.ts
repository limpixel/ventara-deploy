import { NextRequest, NextResponse } from "next/server";

const FLASK_API = process.env.PYTHON_API_URL;

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(
    `${FLASK_API}/cancel_training`, {
    method: "POST",
    headers: {
      Cookie: cookie,
    },
  });

  const data = await res.json();

  return NextResponse.json(data);
}
