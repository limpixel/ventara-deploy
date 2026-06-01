"use client";

import { useState, useEffect } from "react";

interface ModelMetrics {
  MAE: number;
  RMSE: number;
  MAPE: number;
  R2: number;
}

interface ForecastingData {
  dataset_name: string;
  metrics: Record<string, ModelMetrics>;
  best_models: string[];
}

export function useMetrics() {
  const [data, setData] = useState<ForecastingData>({
    dataset_name: "",
    metrics: {},
    best_models: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const username = sessionStorage.getItem("ventara_username") || "";
        const res = await fetch(`/api/forecasting-data?username=${username}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Failed to fetch metrics:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { ...data, loading };
}