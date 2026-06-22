import { NextRequest, NextResponse } from "next/server";
import { PYTHON_API } from "../_config";

export async function DELETE(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username") || "";
  const id = req.nextUrl.searchParams.get("id") || "";
  const res = await fetch(`${PYTHON_API}/delete_history?id=${id}`, {
    method: "DELETE",
    headers: {
      "X-Username": username,
    },
  });
  const data = await res.json();
  return NextResponse.json(data);
}