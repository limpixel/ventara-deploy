import { NextRequest, NextResponse } from "next/server";
const FLASK_API = process.env.PYTHON_API_URL;


export async function GET(req: NextRequest) {

  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(
    `${FLASK_API}/generate_progress`,
    {
      cache: "no-store",
      headers: {
        cookie,
      },
    }
  );

  const data = await res.json();

  return NextResponse.json(data);
}