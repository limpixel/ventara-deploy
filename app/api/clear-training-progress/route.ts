import { NextRequest, NextResponse } from "next/server";
import { PYTHON_API } from "../_config";

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const xUsername = req.headers.get("x-username") || "";

  const res = await fetch(`${PYTHON_API}/clear_train_progress`, {
    method: "POST",
    headers: {
      Cookie: cookie,
      "X-Username": xUsername,
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Flask error", status: res.status }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}