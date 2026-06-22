import { NextRequest, NextResponse } from "next/server";
import { PYTHON_API } from "../_config";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username") || "";

  try {
    const res = await fetch(`${PYTHON_API}/get_history`, {
      cache: "no-store",
      headers: {
        "X-Username": username,
      },
    });

    const data = await res.json();
    console.log("API HISTORY =", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get history fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}