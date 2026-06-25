import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_URL = process.env.PYTHON_API_URL;

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const cookie = req.headers.get("cookie") || "";
  const res = await fetch(
    `${PYTHON_API_URL}/user-data/${params.username}`,
    { headers: { cookie } }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const cookie = req.headers.get("cookie") || "";
  const body = await req.json();
  const res = await fetch(
    `${PYTHON_API_URL}/user-data/${params.username}`,
    {
      method: "PUT",
      headers: {
        cookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}