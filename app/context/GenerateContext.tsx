"use client";
import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";

interface GenerateState {
  visible: boolean;
  percent: number;
  status: string;
  eta: string;
  elapsed: string;
}

interface GenerateContextValue {
  generate: GenerateState;
  startGenerate: (
    model: string,
    onDone?: (nlp: string, ensembleSummary: Record<string, any>) => void,
    selectedVar?: string,
  ) => void;
}

const DEFAULT: GenerateState = {
  visible: false,
  percent: 0,
  status: "Preparing...",
  eta: "--",
  elapsed: "--",
};

const GenerateContext = createContext<GenerateContextValue | null>(null);

export function GenerateProvider({ children }: { children: React.ReactNode }) {
  const [generate, setGenerate] = useState<GenerateState>(DEFAULT);
  const pollActive = useRef(false);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ FIX: retry counter supaya network blip tidak langsung matiin polling
  const errorCount = useRef(0);
  const MAX_ERRORS = 5;

  // ✅ FIX: simpan onDone di ref supaya bisa diakses saat resume setelah refresh
  const onDoneRef = useRef<
    ((nlp: string, ensembleSummary: Record<string, any>) => void) | undefined
  >(undefined);

  const stopPolling = useCallback((resetState = true) => {
    pollActive.current = false;
    errorCount.current = 0;
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
    if (resetState) setGenerate(DEFAULT);
  }, []);

  const pollOnce = useCallback(
    async (
      onDone?: (nlp: string, ensembleSummary: Record<string, any>) => void,
    ) => {
      if (!pollActive.current) return;

      try {
        const headers: Record<string, string> = {};
        const u = sessionStorage.getItem("ventara_username");
        if (u) headers["X-Username"] = u;

        const res = await fetch("/api/generate-progress", { headers });

        // ✅ FIX: handle non-200 response tanpa langsung matiin polling
        if (!res.ok) {
          errorCount.current += 1;
          console.warn(
            `[Poll] HTTP ${res.status}, error ke-${errorCount.current}`,
          );
          if (errorCount.current >= MAX_ERRORS) {
            console.error("[Poll] Terlalu banyak error, polling dihentikan");
            stopPolling(true);
            return;
          }
          // Retry dengan backoff lebih lama
          pollTimer.current = setTimeout(() => pollOnce(onDone), 3000);
          return;
        }

        const prog = await res.json();

        // ✅ FIX: reset error counter kalau berhasil
        errorCount.current = 0;

        // ✅ FIX: handle worker restart — prog kosong / tidak ada running flag
        // Kondisi ini terjadi kalau Gunicorn restart worker di tengah jalan
        if (!prog || typeof prog.running === "undefined") {
          console.warn("[Poll] Response kosong atau tidak valid, retry...");
          pollTimer.current = setTimeout(() => pollOnce(onDone), 2000);
          return;
        }

        // Update UI progress
        const day = prog.day ?? 0;
        const total = prog.total ?? 7;
        const pct =
          total > 0 ? Math.min(Math.floor((day / total) * 100), 99) : 0;

        setGenerate({
          visible: true,
          percent: pct,
          status: `Generating Day ${day}/${total}`,
          eta: prog.eta ?? "--",
          elapsed: prog.elapsed ?? "--",
        });

        // ✅ FIX: handle error dari worker dengan tampilkan pesan, bukan diam-diam reset
        if (prog.error) {
          console.error("[Poll] Worker error:", prog.error);
          stopPolling(false);
          setGenerate((prev) => ({
            ...prev,
            visible: true,
            status: `❌ Error: ${prog.error}`,
            percent: 0,
          }));
          // Sembunyikan toast setelah 4 detik
          setTimeout(() => setGenerate(DEFAULT), 4000);
          return;
        }

        if (prog.done) {
          pollActive.current = false;
          setGenerate((prev) => ({
            ...prev,
            percent: 100,
            status: "Selesai! Menyimpan hasil...",
          }));

          // ✅ FIX: commit dengan retry kalau gagal
          let committed = false;
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const h: Record<string, string> = {};
              const u2 = sessionStorage.getItem("ventara_username");
              if (u2) h["X-Username"] = u2;
              const commitRes = await fetch("/api/generate-commit", {
                method: "POST",
                headers: h,
              });
              const commitData = await commitRes.json();
              if (commitData.status === "ok") {
                committed = true;
                break;
              }
              console.warn(
                `[Commit] Attempt ${attempt + 1} gagal:`,
                commitData,
              );
            } catch (e) {
              console.warn(`[Commit] Attempt ${attempt + 1} error:`, e);
            }
            await new Promise((r) => setTimeout(r, 500));
          }

          if (!committed) {
            console.warn(
              "[Commit] Semua attempt gagal, tapi tetap lanjut dengan data dari progress",
            );
          }

          setTimeout(() => {
            setGenerate(DEFAULT);
            const cb = onDone ?? onDoneRef.current;
            cb?.(prog.nlp_report ?? "", prog.ensemble_summary ?? {});
          }, 1000);
          return;
        }

        // ✅ FIX: kalau running: false tapi done: false = worker mati mendadak (Gunicorn restart)
        // Tunggu sebentar dan coba lagi — worker baru mungkin belum ready
        if (!prog.running && !prog.done) {
          console.warn(
            "[Poll] Worker tidak running dan belum done — kemungkinan Gunicorn restart",
          );
          errorCount.current += 1;
          if (errorCount.current >= MAX_ERRORS) {
            console.error("[Poll] Worker tidak kembali setelah beberapa retry");
            stopPolling(true);
            return;
          }
          pollTimer.current = setTimeout(() => pollOnce(onDone), 3000);
          return;
        }

        // Masih running, lanjut poll
        pollTimer.current = setTimeout(() => pollOnce(onDone), 1500);
      } catch (err) {
        // ✅ FIX: network error tidak langsung matiin polling
        errorCount.current += 1;
        console.warn(`[Poll] Fetch error (ke-${errorCount.current}):`, err);
        if (errorCount.current >= MAX_ERRORS) {
          console.error(
            "[Poll] Terlalu banyak network error, polling dihentikan",
          );
          stopPolling(true);
          return;
        }
        // Retry dengan interval lebih lama
        pollTimer.current = setTimeout(() => pollOnce(onDone), 3000);
      }
    },
    [stopPolling],
  );

  // ✅ Resume toast otomatis pas refresh
  useEffect(() => {
    const resume = async () => {
      if (pollActive.current) return;
      try {
        const headers: Record<string, string> = {};
        const u = sessionStorage.getItem("ventara_username");
        if (u) headers["X-Username"] = u;
        const res = await fetch("/api/generate-progress", { headers });
        if (!res.ok) return;
        const prog = await res.json();
        if (prog.running && !prog.done && !prog.error) {
          pollActive.current = true;
          errorCount.current = 0;
          setGenerate({
            visible: true,
            percent: Math.floor(((prog.day ?? 0) / (prog.total ?? 7)) * 100),
            status: `Generating Day ${prog.day}/${prog.total}`,
            eta: prog.eta ?? "--",
            elapsed: prog.elapsed ?? "--",
          });
          pollOnce(); // resume tanpa onDone
        }
      } catch {
        // Gagal fetch → diam
      }
    };
    resume();
  }, [pollOnce]);

  const startGenerate = useCallback(
    async (
      selectedModel: string,
      onDone?: (nlp: string, ensembleSummary: Record<string, any>) => void,
      selectedVar: string = "WS10M",
    ) => {
      console.log("selectedVar dikirim:", selectedVar);

      // Simpan callback di ref untuk resume setelah refresh
      onDoneRef.current = onDone;

      setGenerate({ ...DEFAULT, visible: true, status: "Memulai generate..." });
      errorCount.current = 0;

      try {
        const headers: Record<string, string> = {};
        const u = sessionStorage.getItem("ventara_username");
        if (u) headers["X-Username"] = u;

        const formData = new FormData();
        formData.append("model", selectedModel);
        formData.append("var", selectedVar);

        const endpoint =
          selectedModel === "best" ? "/api/generate-best" : "/api/generate";
        const res = await fetch(endpoint, {
          method: "POST",
          body: formData,
          headers,
        });
        const data = await res.json();

        if (data.status === "already_running") {
          setGenerate(DEFAULT);
          alert("Generate masih berjalan, tunggu sebentar.");
          return;
        }

        if (data.status === "error") {
          setGenerate(DEFAULT);
          alert(`Error: ${data.message}`);
          return;
        }

        pollActive.current = true;
        pollOnce(onDone);
      } catch (err) {
        setGenerate(DEFAULT);
        console.error("Generate error:", err);
      }
    },
    [pollOnce],
  );

  return (
    <GenerateContext.Provider value={{ generate, startGenerate }}>
      {children}
    </GenerateContext.Provider>
  );
}

export function useGenerateContext() {
  const ctx = useContext(GenerateContext);
  if (!ctx)
    throw new Error("useGenerateContext must be used inside GenerateProvider");
  return ctx;
}
