import os
import json
import numpy as np
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)
from config import (
    MODEL_FOLDER,
    STEP
)

METRICS_PATH = f"{MODEL_FOLDER}/metrics.json"

def get_metrics(y_true, y_pred):
    yt = np.array(y_true).flatten()
    yp = np.array(y_pred).flatten()
    return {
        "MAE": round(float(mean_absolute_error(yt, yp)), 3),
        "RMSE": round(float(np.sqrt(mean_squared_error(yt, yp))), 3),
        "MAPE": round(float(np.mean(np.abs((yt - yp) / yt)) * 100), 2),
        "R2": round(float(r2_score(yt, yp)), 3)
    }

def save_metrics(ml, dl):
    """Simpan metrics ke JSON setelah training."""
    os.makedirs(MODEL_FOLDER, exist_ok=True)
    with open(METRICS_PATH, "w") as f:
        json.dump({"ml": ml, "dl": dl}, f, indent=2)
    print(f"✅ Metrics disimpan ke {METRICS_PATH}")

def load_metrics():
    """Load metrics dari JSON tanpa perlu retrain."""
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r") as f:
            data = json.load(f)
        print("✅ Metrics di-load dari cache")
        return data.get("ml", {}), data.get("dl", {})
    return None, None

def compute_metrics_fresh(
    ML_READY, DL_READY,
    gbr, xgb, knn, scaler, X, y,
    X_scaled, scaler_y, lstm, bilstm
):
    if not ML_READY:
        return {}, {}

    ml = {}
    if gbr is not None:
        ml["GBR"] = get_metrics(y, gbr.predict(X))
    if xgb is not None:
        ml["XGB"] = get_metrics(y, xgb.predict(X))
    if knn is not None and scaler is not None:
        ml["KNN"] = get_metrics(y, knn.predict(scaler.transform(X)))

    dl = {}
    if DL_READY and X_scaled is not None:
        seqs = np.array([
            X_scaled[i-STEP:i]
            for i in range(STEP, len(X_scaled))
        ])
        y_dl = y[STEP:].reshape(-1, 1)
        y_pred_lstm = scaler_y.inverse_transform(
            lstm.predict(seqs, verbose=0)
        )
        y_pred_bilstm = scaler_y.inverse_transform(
            bilstm.predict(seqs, verbose=0)
        )
        dl["LSTM"] = get_metrics(y_dl, y_pred_lstm)
        dl["BiLSTM"] = get_metrics(y_dl, y_pred_bilstm)

    # ✅ Simpan otomatis setelah compute
    save_metrics(ml, dl)

    return ml, dl