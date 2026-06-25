import { NextRequest, NextResponse } from "next/server";
import { PYTHON_API } from "../_config";

export async function GET(req: NextRequest) {
  const username = req.headers.get("x-username") || "";
  const varParam = req.nextUrl.searchParams.get("var") || "WS10M";

  const res = await fetch(`${PYTHON_API}/forecasting_data?var=${varParam}`, { // ← tambah ?var=
    cache: "no-store",
    headers: {
      "X-Username": username,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Flask error:", text);
    return NextResponse.json({ error: "Flask error", detail: text }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}