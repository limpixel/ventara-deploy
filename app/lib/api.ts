export const PYTHON_API_URL =
  process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:5000";

export async function uploadDataset(formData: FormData) {
  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  return res.json()
}

export async function fetchTrainProgress() {
  const res = await fetch("/api/train-progress");
  return res.json();
}

export function downloadCsv(mode: "general" | "best") {
  window.location.href = `/api/download?mode=${mode}`;
}