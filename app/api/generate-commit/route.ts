import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL;

export async function POST(req: NextRequest) {
  const username = req.headers.get("x-username") ?? "";

  const res = await fetch(`${PYTHON_API}/generate_commit`, {
    method: "POST",
    headers: {
      "X-Username": username,
    },
  });

  const data = await res.json();
  return NextResponse.json(data);
}