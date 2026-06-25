import { NextRequest, NextResponse } from "next/server";

const FLASK_API = process.env.PYTHON_API_URL;
export async function GET(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") ?? "general";
    const var_ = searchParams.get("var")  ?? "WS10M";

    const res = await fetch(
      `${FLASK_API}/forecast_result?mode=${mode}&var=${var_}`,
      { cache: "no-store", headers: { cookie } }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { error: "Flask server tidak bisa diakses" },
      { status: 503 }
    );
  }
}