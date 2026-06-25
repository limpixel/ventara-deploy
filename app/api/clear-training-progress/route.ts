import { NextRequest, NextResponse } from "next/server";

const FLASK_API = process.env.PYTHON_API_URL;

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(`${FLASK_API}/clear_train_progress`, {
    method: "POST",
    headers: {
      Cookie: cookie,
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Flask error", status: res.status }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}