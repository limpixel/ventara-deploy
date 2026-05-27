import Link from "next/link";
import { useSaveHistory } from "@/app/hooks/useSaveHistory";

interface Props {
  datasetName: string;
  generateMode: "general" | "best";
  nlpReport: string;
}

export default function OverviewHeader({
  datasetName,
  generateMode,
  nlpReport,
}: Props) {

  const { saveHistory } = useSaveHistory();

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
      </div>

      {/* RIGHT */}
      <div className="flex gap-3">

        <button
          onClick={() =>
            saveHistory({
              file: datasetName,

              algo:
                generateMode === "best"
                  ? "XGB-LSTM"
                  : "General Model",

              periode: "1 Jam",

              hasil: [
                {
                  label: "BiLSTM:",
                  value: "14.30 MW",
                },
              ],

              nlp_report: nlpReport,
            })
          }
          className="bg-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-600 transition"
        >
          Simpan ke Historis
        </button>

        <Link
          href="/history"
          className="flex items-center gap-3 bg-gray-400 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-500 transition"
        >
          <span>Page Data Histories</span>
        </Link>

      </div>
    </div>
  );
}