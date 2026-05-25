"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { fetchTrainProgress } from "@/app/lib/api";

interface TrainingState {
  isTraining: boolean;
  step: string;
  progress: number;
  logs: string[];
  footer: string;
}

interface TrainingContextValue {
  training: TrainingState;
  startTraining: (onComplete?: () => void) => void;
  stopTraining: () => void;
}

const DEFAULT_STATE: TrainingState = {
  isTraining: false,
  step: "",
  progress: 0,
  logs: [],
  footer: "",
};

const STORAGE_KEY = "ventara_training";

const TRAIN_STEPS = [
  "Load dataset",
  "Training GBR",
  "Training XGBoost",
  "Training KNN",
  "Training LSTM",
  "Training BiLSTM",
  "Update globals",
  "Selesai",
];

function calcProgress(step: string, done: boolean): number {
  if (done) return 100;
  const idx = TRAIN_STEPS.findIndex((s) =>
    step.toLowerCase().includes(s.toLowerCase())
  );
  return idx >= 0 ? Math.round(((idx + 1) / TRAIN_STEPS.length) * 100) : 10;
}

const TrainingContext = createContext<TrainingContextValue | null>(null);

export function TrainingProvider({ children }: { children: React.ReactNode }) {
  const [training, setTraining] = useState<TrainingState>(() => {
    if (typeof window === "undefined") return DEFAULT_STATE;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULT_STATE;
      const parsed: TrainingState = JSON.parse(saved);
      if (!parsed.isTraining || parsed.progress >= 100) return DEFAULT_STATE;
      return parsed;
    } catch {
      return DEFAULT_STATE;
    }
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTraining = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTraining(DEFAULT_STATE);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const poll = useCallback((onComplete?: () => void) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      try {
        const data = await fetchTrainProgress();

        const next: TrainingState = {
          isTraining: true,
          step: data.step || "Berjalan...",
          progress: calcProgress(data.step ?? "", data.done),
          logs: data.log?.length ? data.log : [],
          footer: "Jangan tutup halaman ini",
        };

        if (data.done && !data.running) {
          clearInterval(intervalRef.current!);

          if (data.error) {
            stopTraining();
          } else {
            const doneState: TrainingState = {
              ...next,
              progress: 100,
              footer: "✅ Training selesai!",
            };
            setTraining(doneState);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(doneState));

            setTimeout(() => {
              stopTraining();
              onComplete?.();
            }, 2000);
          }
          return;
        }

        setTraining(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.log("Train polling skip:", e);
      }
    }, 2000);
  }, [stopTraining]);

  const startTraining = useCallback((onComplete?: () => void) => {
    const initial: TrainingState = {
      isTraining: true,
      step: "Memulai...",
      progress: 0,
      logs: [],
      footer: "Jangan tutup halaman ini",
    };
    setTraining(initial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    poll(onComplete);
  }, [poll]);

  // Resume polling kalau ada state tersimpan (refresh / balik ke halaman)
  useEffect(() => {
    if (training.isTraining && training.progress < 100) {
      poll(() => window.location.reload());
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TrainingContext.Provider value={{ training, startTraining, stopTraining }}>
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const ctx = useContext(TrainingContext);
  if (!ctx) throw new Error("useTraining must be used inside TrainingProvider");
  return ctx;
}