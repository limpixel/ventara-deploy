import { NextRequest, NextResponse } from "next/server";
import { PYTHON_API } from "../_config";

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode") || "general";
  const cookie = req.headers.get("cookie") || "";
  const xUsername = req.headers.get("x-username") || "";

  const res = await fetch(`${PYTHON_API}/download_forecast?mode=${mode}`, {
    cache: "no-store",
    headers: { cookie, "X-Username": xUsername },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "File belum ada" }, { status: 404 });
  }

  const blob = await res.blob();
  const contentDisposition =
    res.headers.get("content-disposition") ?? `attachment; filename="forecast_${mode}.csv"`;

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": contentDisposition,
    },
  });
}
