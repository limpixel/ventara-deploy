import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();

  const res = await fetch("http://127.0.0.1:5000/generate_full", {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data);

}