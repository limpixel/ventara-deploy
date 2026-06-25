import { NextRequest, NextResponse } from "next/server";
import { PYTHON_API } from "../_config";

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const xUsername = req.headers.get("x-username") || "";
  const formData = await req.formData();
  const res = await fetch(`${PYTHON_API}/upload_dataset`, {
    method: "POST",
    body: formData,
    headers: {
      cookie,
      "X-Username": xUsername,
    },
  });
  const text = await res.text();
  if (!text) {
    return NextResponse.json({ status: "error", message: "Empty response from Flask" }, { status: 500 });
  }
  const data = JSON.parse(text);
  return NextResponse.json(data, { status: res.status });
}