import { NextRequest, NextResponse } from "next/server"
import { PYTHON_API } from "../_config"

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username") || ""

  if (!username) {
    return NextResponse.json(
      { success: false, error: "Username is required" },
      { status: 400 }
    )
  }

  try {
    const res = await fetch(`${PYTHON_API}/storage_info`, {
      cache: "no-store",
      headers: {
        "X-Username": username,
      },
    })

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch storage info" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Storage info fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
