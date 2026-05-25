from flask import *

import os
import pandas as pd

from config import *

main_bp = Blueprint(
    "main",
    __name__
)


# =========================
# ROUTE UTAMA
# =========================
@main_bp.route("/", methods=["GET", "POST"])
def index():
    # Kalau model belum ada, tampilkan halaman upload
    if not ML_READY:
        return render_template(
            "index.html",
            result=[],
            all_metrics={},
            metrics={},
            selected_model="all",
            nlp_report=None,
            last_generate_mode="general",
            best_model_names=[],
            ordered_models=[],
            dataset_name=os.path.basename(get_active_dataset_path()),
            is_custom_dataset=False,
            ml_ready=False
        )
    
    global metrics, metrics_dl
        
    result:       list = []
    selected_model: str = session.get("selected_model", "all")
    nlp_report          = session.get("nlp_report", None)
    last_gen_mode       = session.get("last_generate_mode", "general")

    all_metrics      = {**metrics, **metrics_dl}
    best_model_names = get_best_ml_and_dl(metrics, metrics_dl)
    all_keys         = list(metrics.keys()) + list(metrics_dl.keys())
    ordered_models   = all_keys

    if selected_model == "best":
        rest           = [m for m in all_keys if m not in best_model_names]
        ordered_models = best_model_names + rest

    if request.method == "POST":
        selected_model = request.form.get("model", "all")
        session["selected_model"] = selected_model
        session.pop("nlp_report", None)
        nlp_report = None

        if selected_model == "best":
            rest           = [m for m in all_keys if m not in best_model_names]
            ordered_models = best_model_names + rest
        else:
            ordered_models = all_keys

        active_models = best_model_names if selected_model == "best" else all_keys
        actual        = float(y[-1])

        def add_row(name: str, pred: float) -> None:
            result.append({
                "model":      name,
                "prediction": round(float(pred), 3),
                "actual":     round(actual, 3),
                "error":      round(abs(float(pred) - actual), 3)
            })

        if ML_READY and data_ml is not None and gbr is not None and xgb is not None and knn is not None and scaler is not None:
            if "GBR" in active_models: add_row("GBR", gbr.predict(data_ml)[0])
            if "XGB" in active_models: add_row("XGB", xgb.predict(data_ml)[0])
            if "KNN" in active_models: add_row("KNN", knn.predict(scaler.transform(data_ml))[0])

        if DL_READY and data_seq is not None:
            if "LSTM"   in active_models:
                add_row("LSTM",   scaler_y.inverse_transform(lstm.predict(data_seq,   verbose=0))[0][0])
            if "BiLSTM" in active_models:
                add_row("BiLSTM", scaler_y.inverse_transform(bilstm.predict(data_seq, verbose=0))[0][0])

        result = sorted(result, key=lambda x: x["error"])
        if result:
            pd.DataFrame(result).to_csv("hasil_prediksi.csv", index=False)

    return render_template(
        "index.html",
        result=result,
        all_metrics=all_metrics,
        metrics=all_metrics,
        selected_model=selected_model,
        nlp_report=nlp_report,
        last_generate_mode=last_gen_mode,
        best_model_names=best_model_names,
        ordered_models=ordered_models,
        dataset_name=os.path.basename(get_active_dataset_path()),
        is_custom_dataset=get_active_dataset_path() != DEFAULT_DATASET
    )

