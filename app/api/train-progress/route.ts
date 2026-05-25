import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("http://localhost:5000/train_progress", {
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data);
}