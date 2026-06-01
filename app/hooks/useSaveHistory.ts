"use client";

import toast from "react-hot-toast";

interface SaveHistoryPayload {
  file: string;
  algo: string;
  periode: string;
  hasil: {
    label: string;
    value: string;
  }[];
  nlp_report: string;
}

export function useSaveHistory() {

  const saveHistory = async ({
    file,
    algo,
    periode,
    hasil,
    nlp_report,
  }: SaveHistoryPayload) => {

    try {

      const newItem = {
        id: Date.now(),

        waktu: new Date().toLocaleString("id-ID"),

        file,
        algo,
        periode,
        hasil,

        status: "Selesai",

        nlp_report,
      };

      // =========================
      // HIT API DULU
      // =========================
      const username = sessionStorage.getItem("ventara_username");
      await fetch("http://localhost:5000/save_history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Username": username || "",
        },
        credentials: "include",
        body: JSON.stringify({ entry: newItem }),
      });

      toast.success(
        "Data berhasil disimpan ke historis"
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Gagal menyimpan data historis"
      );
    }
  };

  return {
    saveHistory,
  };
}