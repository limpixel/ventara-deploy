export const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:5000";

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const snippet = text.length > 200 ? `${text.slice(0, 200)}...` : text;
    throw new Error(`HTTP ${res.status}: ${snippet || res.statusText}`);
  }
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}

export async function uploadDataset(formData: FormData) {
  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  return handleResponse(res);
}

export function downloadCsv(mode: "general" | "best") {
  window.location.href = `/api/download?mode=${mode}`;
}

export async function fetchTrainProgress(username?: string) {
  const url = username
    ? `/api/train-progress?username=${encodeURIComponent(username)}`
    : "/api/train-progress"
  const res = await fetch(url, {
    cache: "no-store",
  });

  return handleResponse(res);
}

export async function cancelTraining() {
  const res = await fetch("/api/cancel-training", {
    method: "POST",
  });

  return handleResponse(res);
}

export async function clearTrainProgress() {
  const res = await fetch("/api/clear-training-progress", {
    method: "POST",
  });

  return handleResponse(res);
}