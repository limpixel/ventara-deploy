"use client";

import toast from "react-hot-toast";
import { PYTHON_API_URL } from "@/app/lib/api";

interface SaveHistoryPayload {
  file: string;
  algo: string;
  periode: string;
  hasil: {
    label: string;
    value: string;
  }[];
  nlp_report: string;
  onStorageFull?: () => void;  // ← callback
}

export function useSaveHistory() {

  const saveHistory = async ({
    file,
    algo,
    periode,
    hasil,
    nlp_report,
    onStorageFull,
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

      const username = sessionStorage.getItem("ventara_username");
      const res = await fetch(`${PYTHON_API_URL}/save_history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Username": username || "",
        },
        credentials: "include",
        body: JSON.stringify({ entry: newItem }),
      });

      const json = await res.json();

      if (res.status === 403 && json.storage_full) {
        toast.error("Storage penuh! Upgrade tier untuk menyimpan lebih banyak.");
        onStorageFull?.();  // ← trigger modal
        return;
      }

      if (json.success) {
        toast.success("Data berhasil disimpan ke historis");
      } else {
        toast.error(json.message || "Gagal menyimpan.");
      }

    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan data historis");
    }
  };

  return { saveHistory };
}