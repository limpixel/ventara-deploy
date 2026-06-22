import { NextRequest, NextResponse } from "next/server";
import { PYTHON_API } from "../../_config";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const username = req.nextUrl.searchParams.get("username") || "";

  const res = await fetch(`${PYTHON_API}/snapshots/${id}`, {
    method: "DELETE",
    cache: "no-store",
    headers: {
      "X-Username": username,
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}