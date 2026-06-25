import { NextRequest, NextResponse } from "next/server";
import { PYTHON_API } from "../_config";

export async function POST(req: NextRequest) {
  const username = req.headers.get("x-username") || "";
  const body = await req.json();
  const res = await fetch(`${PYTHON_API}/save_history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Username": username,  // ← tambah
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}