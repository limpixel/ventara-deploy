import os
import traceback
import joblib
import numpy as np

from typing import Any

from config import (
    MODEL_FOLDER,
    TARGET,
    STEP
)


def init_dl_models(df_ref):

    try:
        from tensorflow.keras.models import load_model

        print("📦 Load DL model...")

        lstm = load_model(
            os.path.join(
                MODEL_FOLDER,
                "lstm.h5"
            )
        )

        bilstm = load_model(
            os.path.join(
                MODEL_FOLDER,
                "bilstm.h5"
            )
        )

        scaler_X = joblib.load(
            os.path.join(
                MODEL_FOLDER,
                "scaler_X.pkl"
            )
        )

        scaler_y = joblib.load(
            os.path.join(
                MODEL_FOLDER,
                "scaler_y.pkl"
            )
        )

        if hasattr(
            scaler_X,
            "feature_names_in_"
        ):

            dl_cols = list(
                scaler_X.feature_names_in_
            )

        else:

            dl_cols = [
                c for c in df_ref.columns
                if c != TARGET
            ]

        missing = [
            c for c in dl_cols
            if c not in df_ref.columns
        ]

        if missing:

            raise ValueError(
                f"Kolom DL tidak ada: {missing}"
            )

        X_scaled = np.array(
            scaler_X.transform(
                df_ref[dl_cols].copy()
            ),
            dtype=np.float32
        )

        if len(X_scaled) < STEP:

            raise ValueError(
                f"Data kurang dari STEP ({STEP})"
            )

        data_seq = X_scaled[-STEP:].reshape(
            1,
            STEP,
            X_scaled.shape[1]
        )

        print(
            f"✅ DL siap | shape={X_scaled.shape}"
        )

        return {
            "lstm": lstm,
            "bilstm": bilstm,
            "scaler_X": scaler_X,
            "scaler_y": scaler_y,
            "X_scaled": X_scaled,
            "data_seq": data_seq,
            "DL_INPUT_COLS": dl_cols,
            "DL_READY": True
        }

    except Exception as e:

        print(f"⚠️ DL tidak tersedia: {e}")

        traceback.print_exc()

        return {
            "lstm": None,
            "bilstm": None,
            "scaler_X": None,
            "scaler_y": None,
            "X_scaled": None,
            "data_seq": None,
            "DL_INPUT_COLS": [],
            "DL_READY": False
        }