// app/api/payment/upgrade-tier/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { username, tier } = await req.json()

    if (!username || !tier) {
      return NextResponse.json(
        { success: false, error: "username dan tier wajib diisi" },
        { status: 400 }
      )
    }

    const pythonUrl = process.env.PYTHON_API_URL || "http://localhost:5000"

    const res = await fetch(`${pythonUrl}/upgrade_tier`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Username": username,
        // Forward cookie dari client kalau Python API butuh session
        ...(req.headers.get("cookie")
          ? { Cookie: req.headers.get("cookie")! }
          : {}),
      },
      body: JSON.stringify({ tier }),
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      console.error("[upgrade-tier] Python API error:", data)
      return NextResponse.json(
        { success: false, error: data.message || "Gagal upgrade tier" },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("[upgrade-tier] Error:", err)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}