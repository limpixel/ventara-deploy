import Link from "next/link";

export default function OverviewHeader() {
  return (
    <div className="flex items-center justify-between">

      {/* LEFT */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Tampilan Overview dari Forecasting
        </h2>

        <p className="text-sm text-gray-600 pt-3">
          Hasil tampilan secara keseluruhan dari proses
        </p>

        <p className="text-sm text-gray-500 mt-1">
          Algoritma:
          <span className="text-teal-600 font-medium ml-1">BI-LSTM</span>
          <span className="mx-2">•</span>
          Periode:
          <span className="text-teal-600 font-medium ml-1">1 Jam</span>
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex gap-3">
        <button className="bg-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-600 transition">
          Simpan ke Historis
        </button>

        <Link
          href="/history"
          className="flex items-center gap-3 bg-gray-400 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-500 transition"
        >
          <span>Page Data Histories</span>
          <svg
            className="w-4 h-4 -rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </Link>
      </div>

    </div>
  );
}
