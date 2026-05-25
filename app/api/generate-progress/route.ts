import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("http://127.0.0.1:5000/generate_progress", {
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data);
}