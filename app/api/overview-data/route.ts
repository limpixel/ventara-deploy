import { NextRequest, NextResponse } from "next/server";
import { PYTHON_API } from "../_config";

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const xUsername = req.headers.get("x-username") || "";
  const res = await fetch(`${PYTHON_API}/overview_data`, {
    cache: "no-store",
    headers: { cookie, "X-Username": xUsername },
  });
  const data = await res.json();
  return NextResponse.json(data);
}
