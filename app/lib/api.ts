export const PYTHON_API_URL =
  process.env.NEXT_PUBLIC_PYTHON_API_URL || "/api";

export async function uploadDataset(formData: FormData) {
  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    headers: getUsernameHeader(),
  });

  const text = await res.text();
  if (!text) throw { message: "Server tidak merespons" };

  try {
    return JSON.parse(text);
  } catch {
    throw { message: "Response server tidak valid" };
  }
}

export function downloadCsv(mode: "general" | "best") {
  window.location.href = `/api/download?mode=${mode}`;
}

function getUsernameHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const u = sessionStorage.getItem("ventara_username");
  return u ? { "X-Username": u } : {};
}

export async function fetchTrainProgress() {
  const res = await fetch("/api/train-progress", {
    cache: "no-store",
    headers: getUsernameHeader(),
  });

  return await res.json();
}

export async function cancelTraining() {
  const res = await fetch("/api/cancel-training", {
    method: "POST",
    headers: getUsernameHeader(),
  });

  return await res.json();
}

export async function clearTrainProgress() {
  const res = await fetch("/api/clear-training-progress", {
    method: "POST",
    headers: getUsernameHeader(),
  });

  return await res.json();
}