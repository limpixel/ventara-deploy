"use client";

import { useState } from "react";
import { uploadDataset } from "@/app/lib/api";

export function useUploadDataset() {
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = async (
    files: FileList | null,
    onTrainingStarted?: () => void,
    onReload?: () => void
  ) => {
    if (!files || files.length === 0) {
      setFileName("❌ Tidak ada file dipilih");
      return;
    }

    const file = files[0];

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setFileName("❌ File harus format CSV");
      return;
    }

    setFileName(`📄 ${file.name}`);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("dataset", file);

      const data = await uploadDataset(formData);

      if (data.status === "skipped") {
        setFileName(`✅ ${data.filename} sudah pernah di-train (${data.trained_at}). Model langsung dimuat.`);
        setTimeout(() => onReload?.(), 2000);
        return;
      }

      if (data.status === "started" || data.status === "valid") {
        setFileName(`✅ ${data.filename} berhasil diupload. Training dimulai...`);
        onTrainingStarted?.();
        return;
      }

      if (data.status === "invalid") {
        setFileName("❌ " + (data.errors ?? []).join(", "));
      }

    } catch (err: unknown) {
      const e = err as { errors?: string[]; message?: string };
      if (e.errors) setFileName("❌ " + e.errors.join(", "));
      else if (e.message) setFileName("❌ " + e.message);
      else setFileName("❌ Upload gagal");
    } finally {
      setIsUploading(false);
    }
  };

  const resetDataset = () => setFileName("");

  return { fileName, isUploading, handleFiles, resetDataset };
}