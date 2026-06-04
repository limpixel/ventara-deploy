import os
import shutil
import traceback
import pandas as pd
import numpy as np

from config import *

from training.train_ml import *
from training.train_dl import *

from training.metrics import *

from utils.registry import *
from utils.reload_state import reload_all_globals

from training.feature_engineering import *


def worker_retrain(
    dataset_path,
    train_progress,
    train_lock
):

    # =========================
    # LOGGER
    # =========================
    def log(msg):

        print(msg)

        with train_lock:

            train_progress["step"] = msg

            train_progress["log"].append(msg)

    try:

        # =========================
        # LOAD DATASET
        # =========================
        log("📂 Load dataset...")

        df = load_and_engineer(
            dataset_path
        )

        # =========================
        # FEATURE ENGINEERING
        # =========================
        lag_cols = [
            "lag1",
            "lag2",
            "lag3",
            "lag24"
        ]

        roll_cols = [
            "mean3",
            "mean24"
        ]

        time_cols = [
            "HR",
            "DY",
            "MO",
            "YEAR"
        ]

        extra_cols = [

            c for c in df.columns

            if c not in (
                [TARGET]
                + lag_cols
                + roll_cols
                + time_cols
            )

            and pd.api.types.is_numeric_dtype(
                df[c]
            )
        ]

        features = [

            f for f in (
                time_cols
                + extra_cols
                + lag_cols
                + roll_cols
            )

            if f in df.columns
        ]

        X = np.array(
            df[features].values
        )

        y = np.array(
            df[TARGET].values
        )

        # =========================
        # TRAIN ML
        # =========================
        log("🔧 Training ML...")

        gbr, xgb, knn, scaler = train_ml_models(
            X,
            y,
            features
        )

        log("✅ ML selesai")

        # =========================
        # TRAIN DL — PER VARIABEL
        # =========================
        for var in TRAIN_VARS:
            if var not in df.columns:
                log(f"⚠️ Kolom {var} tidak ada, skip DL")
                continue
            log(f"🔧 Training DL untuk {var}...")
            dl_ok = train_dl_models(df, target_var=var)
            if dl_ok:
                np.log(f"✅ DL {var} selesai")
            else:
                np.log(f"⚠️ DL {var} gagal")

        # =========================
        # SIMPAN REGISTRY + SNAPSHOT ← TAMBAH INI
        # =========================
        log("💾 Simpan registry...")
        file_hash = compute_file_hash(dataset_path)
        snap_dir = get_model_dir_for_hash(file_hash)
        os.makedirs(snap_dir, exist_ok=True)

        for fname in os.listdir(MODEL_FOLDER):
            src = os.path.join(MODEL_FOLDER, fname)
            if os.path.isfile(src):
                shutil.copy2(src, os.path.join(snap_dir, fname))

        registry = load_model_registry(dataset_path)
        registry[file_hash] = {
            "trained_at": pd.Timestamp.now().isoformat(),
            "dataset": os.path.basename(dataset_path)
        }
        save_model_registry(registry, dataset_path)
        log("✅ Registry disimpan")

        # =========================
        # RELOAD GLOBALS ← PINDAH KE SINI
        # =========================
        log("♻️ Reload globals...")
        reload_all_globals(dataset_path)
        log("✅ Reload selesai")

        # =========================
        # FINISH
        # =========================
        log("📊 Hitung metrics...")
        with train_lock:
            train_progress.update({
                "running": False,
                "done": True,
                "error": None,
                "step": "Selesai"
            })

    except Exception as e:
        print(traceback.format_exc())
        with train_lock:
            train_progress.update({
                "running": False,
                "done": True,
                "error": str(e),
                "step": "Error"
            })