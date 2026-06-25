import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL

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