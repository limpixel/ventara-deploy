"use client";

import { usePathname } from "next/navigation";
import { useTraining } from "@/app/context/TrainingContext";

export default function TrainingBanner() {
  const { training } = useTraining();   
  const pathname = usePathname();

  // Secara Global, tampilkan banner jika sedang training
  if (!training.isTraining) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center gap-3 px-4 py-3 bg-indigo-600">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-semibold">Training Model</span>
          <span className="ml-auto text-xs bg-indigo-500 px-2 py-0.5 rounded-full truncate max-w-[120px]">
            {training.step}
          </span>
        </div>

        {/* PROGRESS BAR */}
        <div className="h-1 bg-gray-700">
          <div
            className="h-1 bg-indigo-400 transition-all duration-500"
            style={{ width: `${training.progress}%` }}
          />
        </div>

        {/* LOGS */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-2">Log Training</p>
          <div className="bg-gray-800 rounded-lg p-2 h-28 overflow-y-auto text-xs font-mono space-y-1">
            {training.logs.length === 0 ? (
              <p className="text-gray-500">Menunggu log...</p>
            ) : (
              training.logs.map((log, idx) => (
                <p key={idx}>{log}</p>
              ))
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-2 bg-gray-800 text-xs text-gray-400 text-center">
          {training.footer}
        </div>
      </div>
    </div>
  );
}