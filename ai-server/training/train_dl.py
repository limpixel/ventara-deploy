import os
import joblib
import traceback
import numpy as np

from sklearn.preprocessing import MinMaxScaler

from config import (
    MODEL_FOLDER,
    TARGET,
    STEP
)

def train_dl_models(df):

    try:

        import tensorflow as tf

        from tensorflow.keras.models import Sequential

        from tensorflow.keras.layers import (
            LSTM as KerasLSTM,
            Bidirectional,
            Dense,
            Dropout
        )

        from tensorflow.keras.callbacks import (
            EarlyStopping
        )

        dl_cols = [
            c for c in df.columns
            if c != TARGET
        ]

        scaler_X = MinMaxScaler()
        scaler_y = MinMaxScaler()

        X_scaled = scaler_X.fit_transform(
            df[dl_cols].values
        ).astype(np.float32)

        y_scaled = scaler_y.fit_transform(
            df[TARGET].values.reshape(-1, 1)
        ).astype(np.float32)

        seqs = []
        targets = []

        for i in range(STEP, len(X_scaled)):

            seqs.append(
                X_scaled[i - STEP:i]
            )

            targets.append(
                y_scaled[i]
            )

        seqs = np.array(
            seqs,
            dtype=np.float32
        )

        targets = np.array(
            targets,
            dtype=np.float32
        )

        n_feat = seqs.shape[2]

        es = EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True
        )

        # =========================
        # LSTM
        # =========================
        lstm = Sequential([
            KerasLSTM(64, return_sequences=True, input_shape=(STEP, n_feat)),
            KerasLSTM(64),  # stacked
            Dropout(0.2),
            Dense(32, activation="relu"),
            Dense(1)
        ])

        lstm.compile(
            optimizer="adam",
            loss="mse"
        )

        lstm.fit(
            seqs,
            targets,
            epochs=20,
            batch_size=128,
            validation_split=0.1,
            callbacks=[es],
            verbose=1
        )

        lstm.save(
            f"{MODEL_FOLDER}/lstm.h5"
        )

        # =========================
        # BiLSTM
        # =========================
        bilstm = Sequential([
            Bidirectional(
                KerasLSTM(64)
            ),

            Dropout(0.2),

            Dense(
                32,
                activation="relu"
            ),

            Dense(1)
        ])

        bilstm.compile(
            optimizer="adam",
            loss="mse"
        )

        bilstm.fit(
            seqs,
            targets,
            epochs=20,
            batch_size=128,
            validation_split=0.1,
            callbacks=[es],
            verbose=1
        )

        bilstm.save(
            f"{MODEL_FOLDER}/bilstm.h5"
        )

        joblib.dump(
            scaler_X,
            f"{MODEL_FOLDER}/scaler_X.pkl"
        )

        joblib.dump(
            scaler_y,
            f"{MODEL_FOLDER}/scaler_y.pkl"
        )

        return True

    except Exception as e:

        print(f"⚠️ DL training gagal: {e}")

        traceback.print_exc()

        return False