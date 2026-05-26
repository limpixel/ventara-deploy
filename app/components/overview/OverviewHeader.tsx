import Link from "next/link";
import toast from "react-hot-toast";

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
        <button
          onClick={() => {
            try {

              const oldData = JSON.parse(
                localStorage.getItem("ventara_history") || "[]"
              );

              const newItem = {
                id: Date.now(),

                waktu: new Date().toLocaleString("id-ID"),

                file: "NASA_Baron_Hourly.csv",

                algo: "BI-LSTM",

                periode: "1 Jam",

                hasil: [
                  {
                    label: "BiLSTM:",
                    value: "14.30 MW",
                  },
                ],

                status: "Selesai",

                nlp_report:
                  "Prediksi menunjukkan angin stabil dengan performa model tinggi.",
              };

              localStorage.setItem(
                "ventara_history",
                JSON.stringify([newItem, ...oldData])
              );

              toast.success(
                "Data berhasil disimpan ke historis"
              );

            } catch (error) {

              console.error(error);

              toast.error(
                "Gagal menyimpan data historis"
              );
            }
          }}

          className="bg-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-600 transition"
        >
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
