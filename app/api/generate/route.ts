import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL

export async function POST(req: NextRequest) {

  const cookie = req.headers.get("cookie") || "";

  const formData = await req.formData();

  const res = await fetch(
    `${PYTHON_API}/generate_full`,
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