import { NextResponse } from "next/server";
import { PYTHON_API } from "../_config";

export async function GET() {
  const res = await fetch(`${PYTHON_API}/download_template`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Template tidak tersedia" }, { status: 404 });
  }

  const blob = await res.blob();
  const contentDisposition =
    res.headers.get("content-disposition") ?? 'attachment; filename="template_dataset.csv"';

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": contentDisposition,
    },
  });
}
