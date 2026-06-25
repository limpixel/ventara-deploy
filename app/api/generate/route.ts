import { NextRequest, NextResponse } from "next/server";
import { PYTHON_API } from "../_config";

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const xUsername = req.headers.get("x-username") || "";
  const formData = await req.formData();

  const res = await fetch(
    `${PYTHON_API}/generate_full`,
    {
      method: "POST",
      headers: {
        cookie,
        "X-Username": xUsername,
      },
      body: formData,
    }
  );

  const data = await res.json();

  return NextResponse.json(data);
}