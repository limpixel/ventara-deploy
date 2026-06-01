"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/layout/Sidebar";
import Header from "@/app/components/layout/Header";

type AlgoKey = "BI-LSTM" | "XGB-LSTM" | "LSTM" | "XGBoost";
type StatusKey = "Selesai" | "Error" | "Berjalan";

interface HasilItem {
  label: string;
  value: string;
}

// Tambah nlp_report di interface
interface HistorisItem {
  id: number;
  waktu: string;
  file: string;
  algo: string;        // ← ganti dari AlgoKey biar fleksibel
  periode: string;
  hasil: HasilItem[];
  status: StatusKey;
  nlp_report?: string; // ← tambah
}

const ALGO_STYLE: Record<AlgoKey, string> = {
  "BI-LSTM":  "bg-blue-50 text-blue-700",
  "XGB-LSTM": "bg-purple-50 text-purple-700",
  "LSTM":     "bg-teal-50 text-teal-700",
  "XGBoost":  "bg-amber-50 text-amber-700",
};

const STATUS_STYLE: Record<StatusKey, string> = {
  Selesai:  "bg-green-50 text-green-700",
  Error:    "bg-red-50 text-red-700",
  Berjalan: "bg-amber-50 text-amber-700",
};

const STATUS_DOT: Record<StatusKey, string> = {
  Selesai:  "bg-green-500",
  Error:    "bg-red-500",
  Berjalan: "bg-amber-500",
};

export default function HistorisPage() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<HistorisItem[]>([]);         // ← tambah
  const [detailItem, setDetailItem] = useState<HistorisItem | null>(null); // ← tambah

useEffect(() => {
  async function fetchHistory() {
    try {
      const username = sessionStorage.getItem("ventara_username") || "";
      const res = await fetch(`/api/get-history?username=${username}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  }
  fetchHistory();
}, []);;

  // ganti DUMMY_DATA jadi data
  const filtered = data.filter((d) => {
  const q = search.toLowerCase();
    return (
      d.file.toLowerCase().includes(q) ||
      d.algo.toLowerCase().includes(q) ||
      d.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <Header />

        <div className="p-8">
          <div className="max-w-5xl mx-auto">
          {/* Page header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Historis Perhitungan
            </h2>
            <p className="text-gray-600 text-sm">
              Riwayat semua perhitungan dan prediksi energi angin
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari berdasarkan algoritma atau file..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="bg-teal-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl whitespace-nowrap">
              Total: {filtered.length} Perhitungan
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 w-[18%]">Waktu</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 w-[22%]">File Data</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 w-[12%]">Algoritma</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 w-[10%]">Periode</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 w-[23%]">Hasil Prediksi</th>
                  <th className="text-left px-4 py-3.5 text-xs font-medium text-gray-500 w-[9%]">Status</th>
                  <th className="text-center px-4 py-3.5 text-xs font-medium text-gray-500 w-[6%]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                      Tidak ada data yang cocok
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-xs text-gray-500">{row.waktu}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{row.file}</td>
                      <td className="px-4 py-4">
                        <span className={`... ${ALGO_STYLE[row.algo as AlgoKey] ?? "bg-gray-50 text-gray-700"}`}>
                          {row.algo}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{row.periode}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-0.5">
                          {(row.hasil ?? []).map((h, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span className="text-gray-400 w-16">{h.label}</span>
                              <span className="font-semibold text-gray-700">{h.value}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[row.status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[row.status]}`} />
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setDetailItem(row)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            title="Lihat detail"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-teal-600 hover:bg-teal-50 hover:border-teal-200 transition-colors"
                            title="Unduh CSV"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </div>
        </div>
        {detailItem && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Detail Prediksi</h3>
                <button
                  onClick={() => setDetailItem(null)}
                  className="text-gray-400 hover:text-gray-600 text-lg"
                >✕</button>
              </div>
              <p className="text-xs text-gray-500 mb-1">
                {detailItem.waktu} • {detailItem.file}
              </p>
              <div className="mt-3 p-4 bg-teal-50 rounded-xl border border-teal-100">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {detailItem.nlp_report || "Tidak ada laporan AI tersedia."}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
