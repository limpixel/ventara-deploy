import numpy as np

from config import *

from training.feature_engineering import *

from training.load_ml import init_ml_state
from training.load_dl import init_dl_models

from utils.cache import load_or_compute_metrics


def reload_all_globals(dataset_path):

    df = load_and_engineer(
        dataset_path
    )

    # =========================
    # INIT ML
    # =========================
    ml_state = init_ml_state(df)

    # =========================
    # INIT DL
    # =========================
    dl_state = init_dl_models(df)

    metrics_ml, metrics_dl = (
        load_or_compute_metrics(
            ml_state["ML_READY"],
            dl_state["DL_READY"],
            ml_state["gbr"],
            ml_state["xgb"],
            ml_state["knn"],
            ml_state["scaler"],
            ml_state["X"],
            ml_state["y"],
            dl_state["X_scaled"],
            dl_state["scaler_y"],
            dl_state["lstm"],
            dl_state["bilstm"]
        )
    )

    print(
        f"♻️ Globals reloaded — "
        f"ML: {list(metrics_ml.keys())} | "
        f"DL: {list(metrics_dl.keys())}"
    )

    return {
        "df": df,

        "ml_state": ml_state,

        "dl_state": dl_state,

        "metrics_ml": metrics_ml,

        "metrics_dl": metrics_dl
    }