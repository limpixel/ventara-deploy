"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  fetchTrainProgress,
  clearTrainProgress,
  cancelTraining as cancelTrainingApi,
} from "@/app/lib/api";

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
  cancelTraining: () => Promise<void>;
}

const DEFAULT_STATE: TrainingState = {
  isTraining: false,
  step: "",
  progress: 0,
  logs: [],
  footer: "",
};

function calcProgress(step: string, done: boolean): number {
  if (done) return 100;
  if (!step) return 5;

  const s = step.toLowerCase();

  if (s.includes("load dataset"))        return 10;
  if (s.includes("feature engineering")) return 25;
  if (s.includes("training ml"))         return 40;
  if (s.includes("ml") && s.includes("selesai")) return 55;
  if (s.includes("training dl"))         return 65;
  if (s.includes("dl") && s.includes("selesai")) return 80;
  if (s.includes("update globals"))      return 90;
  if (s.includes("selesai"))             return 100;

  return 15;
}

const TrainingContext = createContext<TrainingContextValue | null>(null);

export function TrainingProvider({ children }: { children: React.ReactNode }) {
  const [training, setTraining] = useState<TrainingState>(DEFAULT_STATE);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollGeneration = useRef(0);

  const stopTraining = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTraining(DEFAULT_STATE);
  }, []);

  const poll = useCallback(
    (onComplete?: () => void) => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      pollGeneration.current += 1;
      const myGen = pollGeneration.current;

      intervalRef.current = setInterval(async () => {
        if (myGen !== pollGeneration.current) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return;
        }
        try {
          const data = await fetchTrainProgress();

          // Training belum mulai di server — jangan reset, tunggu dulu
          if (!data.running && !data.done && !data.step) {
            return;
          }

          const next: TrainingState = {
            isTraining: true,
            step: data.step || "Berjalan...",
            progress: calcProgress(data.step ?? "", data.done),
            logs: data.log?.length ? data.log : [],
            footer: "Jangan tutup halaman ini",
          };

          if (data.done && !data.running) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;

            if (data.cancelled) {
              await clearTrainProgress();
              stopTraining();
              return;
            }

            if (data.error) {
              stopTraining();
            } else {
              const doneState: TrainingState = {
                ...next,
                progress: 100,
                footer: "✅ Training selesai!",
              };
              setTraining(doneState);

              setTimeout(async () => {
                try {
                  await clearTrainProgress();
                } catch {}
                stopTraining();
                onComplete?.();
                window.dispatchEvent(new Event("training-complete"));
              }, 2000);
            }
            return;
          }

          setTraining(next);
        } catch (e) {
          console.log("Train polling skip:", e);
        }
      }, 2000);
    },
    [stopTraining],
  );

  const startTraining = useCallback(
    (onComplete?: () => void) => {
      const initial: TrainingState = {
        isTraining: true,
        step: "Memulai...",
        progress: 0,
        logs: [],
        footer: "Jangan tutup halaman ini",
      };
      setTraining(initial);
      poll(onComplete);
    },
    [poll],
  );

  useEffect(() => {
    const init = async () => {
      try {
        const data = await fetchTrainProgress();

        if (data.running && !intervalRef.current) {
          poll(() => {
            window.dispatchEvent(new Event("training-complete"));
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    init();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [poll]);

  const cancelTraining = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      await cancelTrainingApi();
      await clearTrainProgress();
    } catch (e) {
      console.error("Cancel failed:", e);
    } finally {
      setTraining(DEFAULT_STATE);
    }
  }, []);

  return (
    <TrainingContext.Provider
      value={{
        training,
        startTraining,
        stopTraining,
        cancelTraining,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const ctx = useContext(TrainingContext);
  if (!ctx) throw new Error("useTraining must be used inside TrainingProvider");
  return ctx;
}