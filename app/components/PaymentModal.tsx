"use client"

import { useState, useEffect, useCallback } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { PYTHON_API_URL } from "@/app/lib/api"

const TIER_AMOUNT: Record<string, number> = {
  basic: 1500,
  business: 299000,
}

const TIER_LABEL: Record<string, string> = {
  basic: "Basic (100 MB)",
  
  business: "Business (2048 MB)",
}

interface PaymentModalProps {
  tier: "basic" | "business"
  onClose: () => void
  onSuccess: () => void
}

type PaymentStatus = "loading" | "ready" | "paid" | "expired" | "error"

export default function PaymentModal({ tier, onClose, onSuccess }: PaymentModalProps) {
  const [status, setStatus] = useState<PaymentStatus>("loading")
  const [qrString, setQrString] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [expiredAt, setExpiredAt] = useState<string | null>(null)
  const [countdown, setCountdown] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const amount = TIER_AMOUNT[tier]
  const tierLabel = TIER_LABEL[tier]

  const refreshStorage = useCallback(async () => {
    const username = sessionStorage.getItem("ventara_username") || ""
    onSuccess()
  }, [onSuccess])

  const createTransaction = useCallback(async () => {
    setStatus("loading")
    setErrorMsg("")
    const username = sessionStorage.getItem("ventara_username") || ""

    try {
      const res = await fetch("/api/payment/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          payment_type: "qris",
          customer_name: username,
          tier,
        }),
      })
      const json = await res.json()

      if (json.success && json.payment) {
        setQrString(json.payment.qr_string)
        setTransactionId(json.transaction.id)
        setExpiredAt(json.payment.expired_at || null)
        setStatus("ready")
      } else {
        setStatus("error")
        setErrorMsg(json.error || "Gagal membuat transaksi")
      }
    } catch {
      setStatus("error")
      setErrorMsg("Gagal menghubungi server")
    }
  }, [amount, tier])

  useEffect(() => {
    createTransaction()
  }, [createTransaction])

  useEffect(() => {
    if (status !== "ready") return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/check-status?id=${transactionId}`)
        const json = await res.json()
        if (json.success && json.transaction?.status === "settled") {
          clearInterval(interval)

          const username = sessionStorage.getItem("ventara_username") || ""
          const upgradeRes = await fetch(`${PYTHON_API_URL}/upgrade_tier`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Username": username },
            credentials: "include",
            body: JSON.stringify({ tier }),
          })

          if (!upgradeRes.ok) {
            console.error("Upgrade failed:", await upgradeRes.text())
            return
          }

          setStatus("paid")

          await fetch("/api/payment/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username,
              transaction_id: transactionId,
              tier,
              amount,
              payment_type: "qris",
              reference: `ventara-${tier}-${username}`,
            }),
          })

          setTimeout(() => {
            refreshStorage()
          }, 1500)
        }
      } catch {
        // silent retry
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [status, transactionId, tier, refreshStorage])

  useEffect(() => {
    if (!expiredAt) return

    const tick = () => {
      const diff = new Date(expiredAt).getTime() - Date.now()
      if (diff <= 0) {
        setCountdown("Kedaluwarsa")
        setStatus("expired")
        return
      }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown(`${m}:${s.toString().padStart(2, "0")}`)
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [expiredAt])

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
        <h3 className="font-semibold text-gray-900 text-lg mb-1">Pembayaran QRIS</h3>
        <p className="text-sm text-gray-500 mb-4">{tierLabel}</p>

        {status === "loading" && (
          <div className="py-10">
            <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-gray-500">Menyiapkan pembayaran...</p>
          </div>
        )}

        {status === "ready" && qrString && (
          <>
            <div className="bg-white p-3 rounded-xl border border-gray-200 inline-block mx-auto mb-4">
              <QRCodeCanvas value={qrString} size={220} level="H" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              Rp {amount.toLocaleString("id-ID")}
            </p>
            <p className="text-sm text-gray-500 mb-3">
              Scan QR di atas dengan GoPay / ShopeePay / LinkAja / QRIS
            </p>
            <p className="text-sm text-amber-600 font-medium">
              ⏱ {countdown}
            </p>
          </>
        )}

        {status === "paid" && (
          <div className="py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-lg font-semibold text-green-700">Pembayaran Berhasil!</p>
            <p className="text-sm text-gray-500 mt-1">Storage sedang diupgrade...</p>
          </div>
        )}

        {status === "expired" && (
          <div className="py-8">
            <p className="text-lg font-semibold text-red-600 mb-2">Waktu Habis</p>
            <p className="text-sm text-gray-500 mb-4">QRIS telah kedaluwarsa</p>
            <button
              onClick={createTransaction}
              className="w-full py-3 bg-teal-500 text-white font-medium rounded-xl hover:bg-teal-600 transition"
            >
              Buat Ulang QR
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="py-8">
            <p className="text-lg font-semibold text-red-600 mb-1">Gagal</p>
            <p className="text-sm text-gray-500 mb-4">{errorMsg}</p>
            <button
              onClick={createTransaction}
              className="w-full py-3 bg-teal-500 text-white font-medium rounded-xl hover:bg-teal-600 transition"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {status !== "paid" && (
          <button
            onClick={onClose}
            className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition"
          >
            Batal
          </button>
        )}
      </div>
    </div>
  )
}
