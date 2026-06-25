import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL;

export async function GET(req: NextRequest) {
  const username = req.headers.get("x-username") ?? "";
  const file = req.nextUrl.searchParams.get("file") || "";

  const res = await fetch(
    `${PYTHON_API}/download_history_csv?file=${encodeURIComponent(file)}`,
    {
      headers: { "X-Username": username },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
  }

  const blob = await res.blob();
  return new NextResponse(blob, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${file}"`,
    },
  });
}