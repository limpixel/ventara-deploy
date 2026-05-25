import joblib
import numpy as np

from config import MODEL_FOLDER, TARGET


def load_ml_models():
    try:
        gbr = joblib.load(f"{MODEL_FOLDER}/gbr.pkl")

        xgb = joblib.load(f"{MODEL_FOLDER}/xgb.pkl")

        knn = joblib.load(f"{MODEL_FOLDER}/knn.pkl")

        scaler = joblib.load(
            f"{MODEL_FOLDER}/scaler.pkl"
        )

        feats = joblib.load(
            f"{MODEL_FOLDER}/features.pkl"
        )

        return (
            gbr,
            xgb,
            knn,
            scaler,
            feats
        )

    except Exception as e:

        print(f"⚠️ Model ML tidak tersedia: {e}")

        return (
            None,
            None,
            None,
            None,
            []
        )


def init_ml_state(df):

    gbr, xgb, knn, scaler, FEATURES = (
        load_ml_models()
    )

    ML_READY = all([
        gbr is not None,
        xgb is not None,
        knn is not None,
        scaler is not None,
        len(FEATURES) > 0
    ])

    if ML_READY:

        X = np.array(
            df[FEATURES].values
        )

        y = np.array(
            df[TARGET].values
        )

        data_ml = X[-1].reshape(1, -1)

        print("✅ ML models loaded")

    else:

        print(
            "⚠️ ML models belum ada — upload dataset untuk training"
        )

        X = np.array([])

        y = np.array([])

        data_ml = None

    return {
        "gbr": gbr,
        "xgb": xgb,
        "knn": knn,
        "scaler": scaler,
        "FEATURES": FEATURES,
        "ML_READY": ML_READY,
        "X": X,
        "y": y,
        "data_ml": data_ml,
    }