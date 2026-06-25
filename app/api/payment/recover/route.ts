import { NextRequest, NextResponse } from "next/server"
import { PYTHON_API } from "../../_config"

const TIER_ORDER: Record<string, number> = {
  free: 0,
  basic: 1,
  business: 2,
}

function parseReference(ref: string): { username: string; tier: string } | null {
  const parts = ref.split("-")
  if (parts.length >= 4 && parts[0] === "ventara") {
    return { tier: parts[1], username: parts[2] }
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const { reference, transaction_id, amount, payment_type, paid_at } = await req.json()

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Parameter 'reference' wajib diisi" },
        { status: 400 }
      )
    }

    const parsed = parseReference(reference)
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: "Format referensi tidak valid" },
        { status: 400 }
      )
    }

    const { username, tier } = parsed

    if (!TIER_ORDER[tier]) {
      return NextResponse.json(
        { success: false, error: `Tier '${tier}' tidak dikenal` },
        { status: 400 }
      )
    }

    const paymentRes = await fetch(`${PYTHON_API}/payment_history`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-Username": username,
      },
      body: JSON.stringify({
        transaction_id: transaction_id || reference,
        tier,
        amount: amount || 2000,
        payment_type: payment_type || "qris",
        reference,
        paid_at: paid_at || new Date().toISOString(),
      }),
    })

    const paymentData = await paymentRes.json()
    console.log(`Recovery: payment saved for ${username} -> ${tier}`)

    if (!paymentData.success) {
      return NextResponse.json(paymentData, { status: 500 })
    }

    try {
      const res = await fetch(`${PYTHON_API}/upgrade_tier`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Username": username,
        },
        body: JSON.stringify({ tier }),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error(`Recovery: upgrade failed (${res.status}): ${errText}`)
        return NextResponse.json({
          success: true,
          message: `Payment tersimpan, tapi upgrade tier gagal (${res.status}).`,
          data: paymentData.data,
        })
      }

      console.log(`Recovery: upgrade success ${username} -> ${tier}`)
    } catch (err) {
      console.error(`Recovery: upgrade error: ${err}`)
      return NextResponse.json({
        success: true,
        message: "Payment tersimpan, tapi upgrade tier gagal (network).",
        data: paymentData.data,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Payment recovered: ${username} -> ${tier}`,
      data: paymentData.data,
    })
  } catch (err) {
    console.error("Recovery error:", err)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
