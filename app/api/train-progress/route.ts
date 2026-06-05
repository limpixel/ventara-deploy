import { NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL || "http://localhost:5000";

export async function GET() {
  const res = await fetch(`${PYTHON_API}/train_progress`, {
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data);
}