import { NextRequest, NextResponse } from "next/server"
import { PYTHON_API } from "../../_config"

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")
  if (!username) {
    return NextResponse.json({ success: false, error: "username required" }, { status: 400 })
  }

  try {
    const res = await fetch(`${PYTHON_API}/payment_history`, {
      cache: "no-store",
      headers: { "X-Username": username },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("payment history fetch error:", err)
    return NextResponse.json({ success: false, error: "Gagal mengambil history" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, transaction_id, tier, amount, payment_type, reference, paid_at } = body

    if (!username || !transaction_id) {
      return NextResponse.json({ success: false, error: "username & transaction_id required" }, { status: 400 })
    }

    const res = await fetch(`${PYTHON_API}/payment_history`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-Username": username,
      },
      body: JSON.stringify({
        transaction_id,
        tier: tier || "basic",
        amount: amount || 0,
        payment_type: payment_type || "qris",
        reference: reference || "",
        paid_at: paid_at || new Date().toISOString(),
      }),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("payment history save error:", err)
    return NextResponse.json({ success: false, error: "Gagal menyimpan history" }, { status: 500 })
  }
}
