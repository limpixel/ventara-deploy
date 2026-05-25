// app/api/generate-best/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = await fetch("http://127.0.0.1:5000/generate_best", {
    method: "POST",
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}