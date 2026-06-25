import { NextRequest, NextResponse } from "next/server";

const FLASK_API = process.env.PYTHON_API_URL;

export async function POST(req: NextRequest) {

  const cookie = req.headers.get("cookie") || "";

  const formData = await req.formData();

  const res = await fetch(
    `${FLASK_API}/generate_full`,
    {
      method: "POST",
      headers: {
        cookie,
      },
      body: formData,
    }
  );

  const data = await res.json();

  return NextResponse.json(data);
}