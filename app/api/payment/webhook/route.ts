// webhook/route.ts
import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import crypto from "crypto"

const DATA_DIR = path.join(process.cwd(), "data", "payments")

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LOUVIN_WEBHOOK_SECRET
  if (!secret) {
    // Kalau secret belum diset, skip verifikasi tapi log warning
    console.warn("[webhook] LOUVIN_WEBHOOK_SECRET kosong — verifikasi signature dilewati")
    return true
  }
  if (!signature) {
    console.error("[webhook] Tidak ada signature di header")
    return false
  }
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

function parseReference(ref: string): { username: string; tier: string } | null {
  // Format: ventara-{tier}-{username}-{timestamp}
  // username bisa mengandung "-", jadi ambil dari index 2 sampai sebelum index terakhir
  const parts = ref.split("-")
  if (parts.length < 4 || parts[0] !== "ventara") return null

  const tier = parts[1]
  // Index terakhir adalah timestamp, sisanya adalah username
  const username = parts.slice(2, parts.length - 1).join("-")

  if (!tier || !username) return null
  return { tier, username }
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
  } catch {
    // File belum ada, mulai dari array kosong
  }

  if (records.some((r: any) => r.transaction_id === record.transaction_id)) {
    console.log(`[webhook] Transaction ${record.transaction_id} sudah ada, skip`)
    return
  }

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
  console.log(`[webhook] Payment record disimpan untuk ${record.username}`)
}

async function upgradeTierOnPython(username: string, tier: string): Promise<void> {
  const pythonUrl = process.env.PYTHON_API_URL || "http://localhost:5000"

  const res = await fetch(`${pythonUrl}/upgrade_tier`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Username": username,
    },
    body: JSON.stringify({ tier }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Python API gagal (${res.status}): ${text}`)
  }

  console.log(`[webhook] Upgrade tier berhasil: ${username} -> ${tier}`)
}

export async function POST(req: NextRequest) {
  let rawBody = ""

  try {
    rawBody = await req.text()

    // Verifikasi signature
    const signature =
      req.headers.get("x-louvin-signature") ||
      req.headers.get("x-webhook-signature") ||
      req.headers.get("x-signature")

    if (!verifySignature(rawBody, signature)) {
      console.error("[webhook] Signature tidak valid")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const { event, data } = body

    console.log("[webhook] Diterima:", event, "| transaction_id:", data?.transaction_id)

    if (event !== "payment.settled" || !data) {
      return NextResponse.json({ received: true })
    }

    // Ambil reference — coba beberapa field yang mungkin dipakai Louvin
    const reference: string =
      data.reference || data.order_id || data.external_id || ""

    let username: string | null = null
    let tier = "basic"

    if (reference) {
      const parsed = parseReference(reference)
      if (parsed) {
        username = parsed.username
        tier = parsed.tier
        console.log(`[webhook] Parsed dari reference "${reference}": username=${username}, tier=${tier}`)
      } else {
        console.warn(`[webhook] Gagal parse reference: "${reference}"`)
      }
    }

    // Fallback ke customer_name kalau reference gagal di-parse
    if (!username && data.customer_name) {
      username = data.customer_name
      console.warn(`[webhook] Fallback ke customer_name: ${username}`)
    }

    if (!username) {
      console.error("[webhook] Tidak bisa menentukan username dari payload:", JSON.stringify(data))
      // Tetap return 200 supaya Louvin tidak retry terus
      return NextResponse.json({ received: true, warning: "username tidak ditemukan" })
    }

    // Upgrade tier di Python API — lempar error kalau gagal
    try {
      await upgradeTierOnPython(username, tier)
    } catch (err) {
      console.error("[webhook] Gagal upgrade tier di Python API:", err)
      // Simpan record dulu, manual sync bisa dilakukan nanti
    }

    // Simpan payment record
    await savePaymentRecord({
      username,
      transaction_id: data.transaction_id,
      tier,
      amount: data.net_amount ?? data.amount ?? 0,
      payment_type: data.payment_type || "qris",
      reference,
    })

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("[webhook] Error tidak tertangani:", err)
    // Selalu return 200 ke Louvin supaya tidak retry
    return NextResponse.json({ received: true }, { status: 200 })
  }
}