import { NextRequest, NextResponse } from "next/server";
import { PYTHON_API } from "../_config";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${PYTHON_API}/change_password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
