import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { PYTHON_API } from "../../_config"

const DATA_DIR = path.join(process.cwd(), "data", "payments")

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

async function savePaymentRecord(record: {
  username: string
  transaction_id: string
  tier: string
  amount: number
  payment_type: string
  reference: string
}) {
  const filePath = path.join(DATA_DIR, `${record.username}.json`)
  let records: any[] = []
  try {
    const raw = await fs.readFile(filePath, "utf-8")
    records = JSON.parse(raw)
  } catch {}

  const exists = records.some((r: any) => r.transaction_id === record.transaction_id)
  if (exists) return records

  records.push({
    transaction_id: record.transaction_id,
    tier: record.tier,
    amount: record.amount,
    payment_type: record.payment_type,
    status: "settled",
    reference: record.reference,
    paid_at: new Date().toISOString(),
  })

  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(records, null, 2), "utf-8")
  return records
}

export async function POST(req: NextRequest) {
  try {
    const { reference, transaction_id, amount, payment_type } = await req.json()

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

    const records = await savePaymentRecord({
      username,
      transaction_id: transaction_id || reference,
      tier,
      amount: amount || 2000,
      payment_type: payment_type || "qris",
      reference,
    })

    console.log(`Recovery: payment saved for ${username} -> ${tier}`)

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
          message: `Payment tersimpan, tapi upgrade tier gagal (${res.status}). Reconcile otomatis akan coba lagi.`,
          records,
        })
      }

      console.log(`Recovery: upgrade success ${username} -> ${tier}`)
    } catch (err) {
      console.error(`Recovery: upgrade error: ${err}`)
      return NextResponse.json({
        success: true,
        message: "Payment tersimpan, tapi upgrade tier gagal (network). Reconcile otomatis akan coba lagi.",
        records,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Payment recovered: ${username} -> ${tier}`,
      records,
    })
  } catch (err) {
    console.error("Recovery error:", err)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
