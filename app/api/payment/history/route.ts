// app/api/payment/history/route.ts
import { NextRequest, NextResponse } from "next/server"

const PYTHON_URL = process.env.PYTHON_API_URL || "http://localhost:5000"

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")
  if (!username) {
    return NextResponse.json({ success: false, error: "username required" }, { status: 400 })
  }

  try {
    const res = await fetch(`${PYTHON_URL}/payment_history`, {
      headers: {
        "X-Username": username,
        // Forward cookie supaya session Flask terbawa
        ...(req.headers.get("cookie") ? { Cookie: req.headers.get("cookie")! } : {}),
      },
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("[payment/history GET] Error:", err)
    return NextResponse.json({ success: false, error: "Gagal mengambil history" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, transaction_id, tier, amount, payment_type, reference } = body

    if (!username || !transaction_id) {
      return NextResponse.json(
        { success: false, error: "username & transaction_id required" },
        { status: 400 }
      )
    }

    const res = await fetch(`${PYTHON_URL}/payment_history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Username": username,
        ...(req.headers.get("cookie") ? { Cookie: req.headers.get("cookie")! } : {}),
      },
      body: JSON.stringify({
        transaction_id,
        tier: tier || "basic",
        amount: amount || 0,
        payment_type: payment_type || "qris",
        status: "settled",
        reference: reference || "",
      }),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("[payment/history POST] Error:", err)
    return NextResponse.json({ success: false, error: "Gagal menyimpan history" }, { status: 500 })
  }
}