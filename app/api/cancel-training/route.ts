import { NextRequest, NextResponse } from "next/server";
import { PYTHON_API } from "../_config";

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(
    `${PYTHON_API}/cancel_training`,
    {
      method: "POST",
      headers: {
        Cookie: cookie,
      },
    }
  );

  const data = await res.json();

  return NextResponse.json(data);
}