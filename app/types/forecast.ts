export interface Metric {
  MAE: number;
  RMSE: number;
  MAPE: number;
  R2: number;
}

export interface PredictionRow {
  model: string;
  prediction: number;
  actual: number;
  error: number;
}