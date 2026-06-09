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

export async function clearTrainProgress() {
  const res = await fetch(`${PYTHON_API_URL}/clear_training`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}

export async function cancelTraining() {
  const res = await fetch("/api/cancel-training", {
    method: "POST",
  });
  return res.json();
}