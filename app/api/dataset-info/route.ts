import { NextRequest, NextResponse } from "next/server";
import { PYTHON_API } from "../_config";

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const res = await fetch(`${PYTHON_API}/dataset_info`, {
    cache: "no-store",
    headers: { cookie },
  });
  const data = await res.json();
  return NextResponse.json(data);
}
