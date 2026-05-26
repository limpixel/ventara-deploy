"use client";

import Sidebar from "@/app/components/layout/Sidebar";
import Header from "@/app/components/layout/Header";

import OverviewHeader from "@/app/components/overview/OverviewHeader";
import ForecastChart from "@/app/components/overview/ForecastChart";
import NLPResult from "@/app/components/upload/NLPResult";
import { useEffect, useState } from "react";

export default function OverviewPage() {
  const [nlpReport, setNlpReport] = useState("");
  const [generateMode, setGenerateMode] = useState<"general" | "best">("general");

    useEffect(() => {
      fetch("http://localhost:5000/overview_data", {
  credentials: "include"
})
        .then(res => res.json())
        .then(data => {
          if (data.nlp_report) setNlpReport(data.nlp_report);
          if (data.generate_mode) setGenerateMode(data.generate_mode);
        })
        .catch(() => {});
    }, []);

    // dummy data
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const actualData = [3,4,5,6,4,5,6,7,6,5,4,5,6,7,8,7,6,5,4,3,4,5,6,5];
    const datasets = {
      GBR: actualData.map(v => v + Math.random()),
      XGB: actualData.map(v => v + Math.random()),
      KNN: actualData.map(v => v + Math.random()),
      LSTM: actualData.map(v => v + Math.random()),
      BiLSTM: actualData.map(v => v + Math.random())
    };


  return (

    <div className="flex h-screen bg-gray-50">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">

        {/* HEADER */}
        <Header />

        {/* CONTENT */}
        <div className="p-8">

          <div className="max-w-6xl mx-auto space-y-8">

            <OverviewHeader />

            <NLPResult
              nlpReport={nlpReport}
              generateMode={generateMode}
              onReset={() => setNlpReport("")}
              hideActions
            />

            <ForecastChart
              labels={labels}
              actualData={actualData}
              datasets={datasets}
            />

          </div>

        </div>

      </main>

    </div>

  );
}