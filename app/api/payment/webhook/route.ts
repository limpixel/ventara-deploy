import { NextRequest, NextResponse } from "next/server"
import { PYTHON_API } from "../../_config"

function parseReference(ref: string): { username: string; tier: string } | null {
  const parts = ref.split("-")
  if (parts.length >= 4 && parts[0] === "ventara") {
    return { tier: parts[1], username: parts[2] }
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, data } = body

    console.log("Webhook received:", event, data?.transaction_id)

    if (event === "payment.settled" && data) {
      let username: string | null = null
      let tier = "basic"

      if (data.order_id) {
        const parsed = parseReference(data.order_id)
        if (parsed) {
          username = parsed.username
          tier = parsed.tier
        }
      }

      if (!username && data.customer_name) {
        username = data.customer_name
      }

      if (username) {
        const res = await fetch(`${PYTHON_API}/payment_history`, {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "X-Username": username,
          },
          body: JSON.stringify({
            transaction_id: data.transaction_id,
            tier,
            amount: data.net_amount || data.amount || 0,
            payment_type: data.payment_type || "qris",
            reference: data.order_id || "",
            paid_at: data.settled_at || new Date().toISOString(),
          }),
        })
        console.log(`Webhook: payment saved for ${username} -> ${tier} (${data.transaction_id})`)

        try {
          const upgrade = await fetch(`${PYTHON_API}/upgrade_tier`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Username": username,
            },
            body: JSON.stringify({ tier }),
          })
          if (upgrade.ok) {
            console.log(`Webhook: upgrade success ${username} -> ${tier}`)
          } else {
            console.error(`Webhook: upgrade failed (${upgrade.status})`)
          }
        } catch (err) {
          console.error(`Webhook: upgrade error: ${err}`)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("webhook error:", err)
    return NextResponse.json({ received: true }, { status: 200 })
  }
}
