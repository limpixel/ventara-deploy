import os
import json

from config import MODEL_FOLDER

from utils.dataset import (
    get_active_dataset_path
)

from training.metrics import (
    compute_metrics_fresh
)


def get_metrics_cache_path(
    
    dataset_path: str = ""
):

    if not dataset_path:

        dataset_path = (
            get_active_dataset_path()
        )

    name = (
        os.path.basename(dataset_path)
        .replace(".csv", "")
    )

    return os.path.join(
        MODEL_FOLDER,
        f"cache_{name}.json"
    )


def get_model_cache_dir(
    dataset_path: str = ""
):

    if not dataset_path:

        dataset_path = (
            get_active_dataset_path()
        )

    name = (
        os.path.basename(dataset_path)
        .replace(".csv", "")
    )

    return os.path.join(
        MODEL_FOLDER,
        f"models_{name}"
    )


def load_or_compute_metrics(
    ML_READY,
    DL_READY,
    gbr,
    xgb,
    knn,
    scaler,
    X,
    y,
    X_scaled,
    scaler_y,
    lstm,
    bilstm
):

    if not ML_READY:

        print(
            "⚠️ Skip load metrics — model belum tersedia"
        )

        return {}, {}

    cache_path = (
        get_metrics_cache_path()
    )

    # =========================
    # LOAD CACHE
    # =========================
    if os.path.exists(cache_path):

        try:

            with open(cache_path, "r") as f:

                cache = json.load(f)

            print(
                f"⚡ Load metrics dari cache: "
                f"{os.path.basename(cache_path)}"
            )

            if (
                DL_READY and
                not cache.get("dl")
            ):

                print(
                    "🔄 Cache tidak ada DL metrics, hitung ulang..."
                )

                os.remove(cache_path)

            else:

                return (
                    cache["ml"],
                    cache.get("dl", {})
                )

        except Exception as e:

            print(f"❌ Cache rusak: {e}")

            if os.path.exists(cache_path):

                os.remove(cache_path)

    # =========================
    # COMPUTE BARU
    # =========================
    print(
        "🆕 Hitung metrics pertama kali..."
    )

    ml, dl = compute_metrics_fresh(
        ML_READY,
        DL_READY,
        gbr,
        xgb,
        knn,
        scaler,
        X,
        y,
        X_scaled,
        scaler_y,
        lstm,
        bilstm
    )

    with open(cache_path, "w") as f:

        json.dump(
            {
                "ml": ml,
                "dl": dl
            },
            f,
            indent=2
        )

    print(
        f"✅ Cache disimpan: "
        f"{os.path.basename(cache_path)}"
    )

    return ml, dl