"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/app/components/layout/Sidebar"
import Header from "@/app/components/layout/Header"

interface PaymentRecord {
  transaction_id: string
  tier: string
  amount: number
  payment_type: string
  status: string
  paid_at: string
  reference: string
}

const TIER_LABEL: Record<string, string> = {
  basic: "Basic",
  business: "Business",
}

const PAYMENT_LABEL: Record<string, string> = {
  qris: "QRIS",
  gopay: "GoPay",
  shopeepay: "ShopeePay",
  bni_va: "BNI VA",
  bri_va: "BRI VA",
  permata_va: "Permata VA",
  cimb_niaga_va: "CIMB VA",
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPayments() {
      const username = sessionStorage.getItem("ventara_username") || ""
      if (!username) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/payment/history?username=${username}`)
        const json = await res.json()
        if (json.success) {
          setPayments(json.data.reverse())
        }
      } catch (err) {
        console.error("Failed to fetch payment history:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function formatAmount(amount: number) {
    return `Rp ${amount.toLocaleString("id-ID")}`
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        <div className="p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Riwayat Pembayaran
              </h2>
              <p className="text-gray-600 text-sm">
                Daftar semua transaksi upgrade penyimpanan
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Memuat riwayat...</p>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-16">
                  <svg
                    className="w-12 h-12 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p className="text-gray-400 text-sm">Belum ada pembayaran</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Pembayaran akan muncul di sini setelah upgrade
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 w-[8%]">
                        No
                      </th>
                      <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 w-[22%]">
                        Tanggal
                      </th>
                      <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 w-[15%]">
                        Paket
                      </th>
                      <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 w-[18%]">
                        Jumlah
                      </th>
                      <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 w-[15%]">
                        Metode
                      </th>
                      <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 w-[12%]">
                        Status
                      </th>
                      <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 w-[10%]">
                        ID Transaksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, i) => (
                      <tr
                        key={p.transaction_id}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 text-xs text-gray-400">
                          {i + 1}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600">
                          {formatDate(p.paid_at)}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-medium text-gray-800">
                            {TIER_LABEL[p.tier] || p.tier}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                          {formatAmount(p.amount)}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600">
                          {PAYMENT_LABEL[p.payment_type] || p.payment_type}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Berhasil
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 font-mono">
                          {p.transaction_id.slice(0, 8)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
