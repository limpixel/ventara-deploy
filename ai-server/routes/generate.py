from flask import *

import os
import time
import traceback
import threading
import joblib

import numpy as np
import pandas as pd

from config import *
from config import TARGET 

from utils.dataset import *
from utils.progress import *

from training.nlp import *

from config import OUTPUT_FOLDER


generate_bp = Blueprint(
    "generate",
    __name__
)

# =========================
# ROUTE PROGRESS GENERATE
# =========================
@generate_bp.route("/generate_progress")
def get_progress():
    with progress_lock:
        
        username = session.get("username")

        print("RAW COOKIE =", request.headers.get("Cookie"))
        print("SESSION =", dict(session))
        print("USERNAME =", session.get("username"))
        
        p = generate_progress.get(username, {})
    elapsed = time.time() - p["start_time"] if p.get("start_time") else 0
    day     = p.get("day", 0)
    total   = p.get("total", 7)
    eta_str = (
        f"{int(max(0,(total-day)*(elapsed/day))//60)}m "
        f"{int(max(0,(total-day)*(elapsed/day))%60)}s"
        if day > 0 and elapsed > 0 else "Menghitung..."
    )
    return jsonify({
        "running":    p.get("running", False),
        "done":       p.get("done", False),
        "day":        day, "total": total,
        "mode":       p.get("mode", ""),
        "eta":        eta_str,
        "elapsed":    f"{int(elapsed//60)}m {int(elapsed%60)}s",
        "error":      p.get("error"),
        "nlp_report": p.get("nlp_report"),
        "last_mode":  p.get("last_mode", "general")
    })

# =========================
# ROUTE COMMIT GENERATE
# =========================
@generate_bp.route("/generate_commit", methods=["POST"])
def generate_commit():

    username = session.get("username")

    with progress_lock:
        p = generate_progress.get(username, {})

    if p.get("done") and p.get("nlp_report"):

        session["nlp_report"] = p["nlp_report"]
        session["last_generate_mode"] = p.get("last_mode", "general")

        session.modified = True

        return jsonify({"status": "ok"})

    return jsonify({"status": "no_data"}), 400

# =========================
# BACKGROUND WORKER — GENERATE FULL
# =========================
def _worker_generate_full(username: str, selected_model: str, active_models: list, output_mode: str = "general", selected_var: str = "WS10M") -> None:
    from app import (
    df,
    X,
    y,
    gbr,
    xgb,
    knn,
    scaler,
    FEATURES,
    ML_READY,
    DL_READY,
    lstm,
    bilstm,
    scaler_X,
    scaler_y,
    X_scaled,
    metrics,
    metrics_dl,
    DL_INPUT_COLS
)
    try:
        np.random.seed(42)
        df_out = df.copy()
        
        if ML_READY and gbr is not None and xgb is not None and knn is not None and scaler is not None:
            if "GBR" in active_models: df_out["GBR"] = gbr.predict(X)
            if "XGB" in active_models: df_out["XGB"] = xgb.predict(X)
            if "KNN" in active_models: df_out["KNN"] = knn.predict(scaler.transform(X))

        need_dl = DL_READY and X_scaled is not None and any(
            m in active_models for m in ["LSTM", "BiLSTM"]
        )
        if (
            need_dl
            and X_scaled is not None
            and scaler_y is not None
            and lstm is not None
            and bilstm is not None
        ):

            seqs_hist = np.array([
                X_scaled[i-STEP:i]
                for i in range(STEP, len(X_scaled))
            ])

            lstm_preds = scaler_y.inverse_transform(
                lstm.predict(seqs_hist, verbose=0)
            ).flatten()

            bilstm_preds = scaler_y.inverse_transform(
                bilstm.predict(seqs_hist, verbose=0)
            ).flatten()

            df_out["LSTM"] = np.nan
            df_out["BiLSTM"] = np.nan

            if "LSTM" in active_models:
                df_out.loc[df_out.index[STEP:], "LSTM"] = lstm_preds

            if "BiLSTM" in active_models:
                df_out.loc[df_out.index[STEP:], "BiLSTM"] = bilstm_preds
                
        future_steps  = 24 * 7
        target_series = df[selected_var].tolist()
        last_row_dict = df.iloc[-1].to_dict()
        last_time     = pd.Timestamp(
            year=int(last_row_dict["YEAR"]), month=int(last_row_dict["MO"]),
            day=int(last_row_dict["DY"]),   hour=int(last_row_dict["HR"])
        )
        history_window = df.tail(STEP).copy().reset_index(drop=True)
        future_rows    = []

        for i in range(future_steps):
            if i % 24 == 0:
                with progress_lock:
                    generate_progress[username]["day"] = (i // 24) + 1
                print(f"⏳ Day {(i//24)+1}/7")

            next_time = last_time + pd.Timedelta(hours=i + 1)
            lag1  = target_series[-1];  lag2  = target_series[-2]
            lag3  = target_series[-3];  lag24 = target_series[-24]
            mean3  = float(np.mean(target_series[-3:]))
            mean24 = float(np.mean(target_series[-24:]))

            fv: list = []
            for col in FEATURES:
                if   col == "lag1":   fv.append(lag1)
                elif col == "lag2":   fv.append(lag2)
                elif col == "lag3":   fv.append(lag3)
                elif col == "lag24":  fv.append(lag24)
                elif col == "mean3":  fv.append(mean3)
                elif col == "mean24": fv.append(mean24)
                elif col == "HR":     fv.append(int(next_time.hour))
                elif col == "DY":     fv.append(int(next_time.day))
                elif col == "MO":     fv.append(int(next_time.month))
                elif col == "YEAR":   fv.append(int(next_time.year))
                else:                 fv.append(float(last_row_dict.get(col, 0.0)))

            X_fut    = np.array(fv, dtype=np.float32).reshape(1, -1)
            pred_gbr = float(gbr.predict(X_fut)[0])                   if ("GBR" in active_models and gbr   is not None)                          else float("nan")
            pred_xgb = float(xgb.predict(X_fut)[0])                   if ("XGB" in active_models and xgb   is not None)                          else float("nan")
            pred_knn = float(knn.predict(scaler.transform(X_fut))[0]) if ("KNN" in active_models and knn   is not None and scaler is not None)    else float("nan")

            anchor = pred_gbr
            if np.isnan(anchor): anchor = pred_xgb
            if np.isnan(anchor): anchor = pred_knn
            if np.isnan(anchor): anchor = lag1

            pred_lstm = pred_bilstm = float("nan")
            if need_dl and any(m in active_models for m in ["LSTM", "BiLSTM"]):
                try:
                    new_row = history_window.iloc[-1].copy()
                    new_row["YEAR"]  = int(next_time.year)
                    new_row["MO"]    = int(next_time.month)
                    new_row["DY"]    = int(next_time.day)
                    new_row["HR"]    = int(next_time.hour)

                    new_row[selected_var] = anchor  # ← ganti dari new_row[TARGET]

                    new_row["lag1"]  = lag1
                    new_row["lag2"]  = lag2
                    new_row["lag3"]  = lag3
                    new_row["lag24"] = lag24

                    new_row["mean3"]  = mean3
                    new_row["mean24"] = mean24
                    
                    history_window = pd.concat(
                        [history_window.iloc[1:], pd.DataFrame([new_row])],
                        ignore_index=True
                    )
                    window_sc  = scaler_X.transform(history_window[DL_INPUT_COLS].values)
                    seq_future = window_sc.reshape(1, STEP, window_sc.shape[1])
                    if "LSTM"   in active_models:
                        pred_lstm   = float(scaler_y.inverse_transform(lstm.predict(seq_future,   verbose=0))[0][0])
                    if "BiLSTM" in active_models:
                        pred_bilstm = float(scaler_y.inverse_transform(bilstm.predict(seq_future, verbose=0))[0][0])
                except Exception as dl_err:
                    print(f"⚠️ DL skip iter {i}: {dl_err}")

            target_series.append(anchor)
            row: dict = {
                "YEAR": int(next_time.year), "MO": int(next_time.month),
                "DY":   int(next_time.day),  "HR": int(next_time.hour),
                selected_var: round(anchor, 3),
            }
            if "GBR"    in active_models: row["GBR"]    = round(pred_gbr,    3) if not np.isnan(pred_gbr)    else np.nan
            if "XGB"    in active_models: row["XGB"]    = round(pred_xgb,    3) if not np.isnan(pred_xgb)    else np.nan
            if "KNN"    in active_models: row["KNN"]    = round(pred_knn,    3) if not np.isnan(pred_knn)    else np.nan
            if "LSTM"   in active_models: row["LSTM"]   = round(pred_lstm,   3) if not np.isnan(pred_lstm)   else np.nan
            if "BiLSTM" in active_models: row["BiLSTM"] = round(pred_bilstm, 3) if not np.isnan(pred_bilstm) else np.nan
            future_rows.append(row)

        df_future  = pd.DataFrame(future_rows)
        df_out     = pd.concat([df_out, df_future], ignore_index=True)
        stats      = build_forecast_text(df_future.copy(), selected_var)
        best_name  = get_best_ml_and_dl(metrics, metrics_dl)[0]
        nlp_report = generate_nlp_report(stats, best_name, {**metrics, **metrics_dl}[best_name])

        base_cols = ["YEAR", "MO", "DY", "HR", selected_var]
        pred_cols = [c for c in ["GBR", "XGB", "KNN", "LSTM", "BiLSTM"] if c in df_out.columns]
        df_out    = df_out[base_cols + pred_cols]
        for col in ["YEAR", "MO", "DY", "HR"]:
            df_out[col] = df_out[col].astype(int)
        for col in df_out.select_dtypes(include=[np.number]).columns:
            df_out[col] = df_out[col].round(3)
            df_out[col] = df_out[col].astype(str).str.replace(".", ",", regex=False)

        # ⬅️ BERUBAH: pakai output_mode buat nentuin nama file
        filename = (
            f"{username}_hasil_prediksi_best.csv"
            if output_mode == "best"
            else f"{username}_hasil_prediksi_general.csv"
        )
        output_path = os.path.join(OUTPUT_FOLDER, filename)
        
        with open(output_path, "w", encoding="utf-8-sig", newline="") as f:
            f.write("-BEGIN HEADER-\n")
            f.write(f"Dataset: {os.path.basename(get_active_dataset_path())}\n")
            f.write(f"Forecast Summary:\n{nlp_report}\n\n-END HEADER-\n\n")
            df_out.to_csv(f, index=False, sep=";")

        with progress_lock:
            generate_progress[username].update({
                "running": False, "done": True,
                "nlp_report": nlp_report,
                "last_mode": output_mode,  # ⬅️ BERUBAH: pakai output_mode
                "error": None
            })

    except Exception as e:
        print(f"❌ Worker error: {traceback.format_exc()}")
        with progress_lock:
            generate_progress[username].update({
                "running": False, "done": True, "nlp_report": None, "error": str(e)
            })

# =========================
# BACKGROUND WORKER — GENERATE BEST
# =========================
def _worker_generate_best(username: str) -> None:
    from app import (
        df,
        X,
        y,
        xgb,
        STEP,
        FEATURES,
        TARGET,
        DL_READY,
        DL_INPUT_COLS,
        MODEL_FOLDER,
        OUTPUT_FOLDER,
        get_active_dataset_path,
        metrics_dl,
    )
    from training.metrics import get_metrics
    from training.nlp import build_forecast_text, generate_nlp_report

    try:
        # Validasi DL sebelum load
        if not DL_READY:
            raise ValueError("Model DL belum siap — latih dulu sebelum generate best.")

        # Load fresh di thread ini — hindari TF cross-thread issue
        from tensorflow.keras.models import load_model as _load

        # Pilih DL terbaik berdasarkan MAPE
        best_dl_name = min(metrics_dl, key=lambda m: metrics_dl[m]["MAPE"]) if metrics_dl else "LSTM"
        dl_filename  = "bilstm.h5" if best_dl_name.upper() == "BILSTM" else "lstm.h5"
        print(f"🤖 Best DL: {best_dl_name} ({dl_filename})")

        _lstm     = _load(os.path.join(MODEL_FOLDER, dl_filename))
        _scaler_X = joblib.load(os.path.join(MODEL_FOLDER, "scaler_X.pkl"))
        _scaler_y = joblib.load(os.path.join(MODEL_FOLDER, "scaler_y.pkl"))
        _dl_cols  = DL_INPUT_COLS if DL_INPUT_COLS else [c for c in df.columns if c != TARGET]

        np.random.seed(42)
        df_out = df.copy()

        # — Historis: XGB base —
        if xgb is not None and len(X) > 0:
            df_out["XGB_Base"] = xgb.predict(X)

        # — Historis: LSTM stacked —
        _X_sc     = np.array(_scaler_X.transform(df[_dl_cols].values), dtype=np.float32)
        seqs_hist = np.array([_X_sc[i-STEP:i] for i in range(STEP, len(_X_sc))])
        stacked_preds = _scaler_y.inverse_transform(
            _lstm.predict(seqs_hist, verbose=0)
        ).flatten()

        stacked_col = f"XGB_{best_dl_name}_Stacked"
        df_out[stacked_col] = np.nan
        df_out.loc[df_out.index[STEP:], stacked_col] = stacked_preds

        stacking_metrics = get_metrics(
            np.array(y[STEP:STEP + len(stacked_preds)]),
            np.array(stacked_preds)
        )
        print(f"📊 Stacking Metrics: {stacking_metrics}")

        # — Future forecast —
        future_steps   = 24 * 7
        target_series  = df[TARGET].tolist()
        last_row_dict  = df.iloc[-1].to_dict()
        last_time      = pd.Timestamp(
            year=int(last_row_dict["YEAR"]), month=int(last_row_dict["MO"]),
            day=int(last_row_dict["DY"]),   hour=int(last_row_dict["HR"])
        )
        history_window = df.tail(STEP).copy().reset_index(drop=True)
        future_rows    = []

        for i in range(future_steps):
            if i % 24 == 0:
                with progress_lock:
                    generate_progress[username]["day"] = (i // 24) + 1
                print(f"⏳ Day {(i//24)+1}/7")

            next_time = last_time + pd.Timedelta(hours=i + 1)
            lag1  = target_series[-1];  lag2  = target_series[-2]
            lag3  = target_series[-3];  lag24 = target_series[-24]
            mean3  = float(np.mean(target_series[-3:]))
            mean24 = float(np.mean(target_series[-24:]))

            fv = []
            for col in FEATURES:
                if   col == "lag1":   fv.append(lag1)
                elif col == "lag2":   fv.append(lag2)
                elif col == "lag3":   fv.append(lag3)
                elif col == "lag24":  fv.append(lag24)
                elif col == "mean3":  fv.append(mean3)
                elif col == "mean24": fv.append(mean24)
                elif col == "HR":     fv.append(int(next_time.hour))
                elif col == "DY":     fv.append(int(next_time.day))
                elif col == "MO":     fv.append(int(next_time.month))
                elif col == "YEAR":   fv.append(int(next_time.year))
                else:                 fv.append(float(last_row_dict.get(col, 0.0)))

            X_fut    = np.array(fv, dtype=np.float32).reshape(1, -1)
            pred_xgb = float(xgb.predict(X_fut)[0]) if xgb is not None else float("nan")

            # Update history window — XGB sebagai anchor
            new_row           = history_window.iloc[-1].copy()
            new_row["YEAR"]   = int(next_time.year)
            new_row["MO"]     = int(next_time.month)
            new_row["DY"]     = int(next_time.day)
            new_row["HR"]     = int(next_time.hour)
            new_row[TARGET]   = pred_xgb  # anchor untuk LSTM
            new_row["lag1"]   = lag1
            new_row["lag2"]   = lag2
            new_row["lag3"]   = lag3
            new_row["lag24"]  = lag24
            new_row["mean3"]  = mean3
            new_row["mean24"] = mean24

            history_window = pd.concat(
                [history_window.iloc[1:], pd.DataFrame([new_row])],
                ignore_index=True
            )

            # LSTM baca window yang sudah diisi XGB
            window_sc    = _scaler_X.transform(history_window[_dl_cols].values)
            seq_future   = window_sc.reshape(1, STEP, window_sc.shape[1])
            pred_stacked = float(_scaler_y.inverse_transform(
                _lstm.predict(seq_future, verbose=0))[0][0])

            target_series.append(pred_stacked)
            future_rows.append({
                "YEAR": int(next_time.year), "MO": int(next_time.month),
                "DY":   int(next_time.day),  "HR": int(next_time.hour),
                "XGB_Base": round(pred_xgb,     3),
                stacked_col: round(pred_stacked, 3)
            })

        df_future  = pd.DataFrame(future_rows)
        df_out     = pd.concat([df_out, df_future], ignore_index=True)
        df_out     = df_out[["YEAR", "MO", "DY", "HR", TARGET, "XGB_Base", stacked_col]]
        stats      = build_forecast_text(df_future.rename(columns={stacked_col: TARGET}), TARGET)
        stacking_name = f"XGB-{best_dl_name} Stacking"
        nlp_report = generate_nlp_report(stats, stacking_name, stacking_metrics)

        for col in ["YEAR", "MO", "DY", "HR"]:
            df_out[col] = df_out[col].astype(int)
        for col in df_out.select_dtypes(include=[np.number]).columns:
            df_out[col] = df_out[col].round(3)
            df_out[col] = df_out[col].astype(str).str.replace(".", ",", regex=False)

        output_path = os.path.join(
            OUTPUT_FOLDER,
            f"{username}_hasil_prediksi_best.csv"
        )
        with open(output_path, "w", encoding="utf-8-sig", newline="") as f:
            f.write("-BEGIN HEADER-\n")
            f.write(f"Dataset: {os.path.basename(get_active_dataset_path())}\n")
            f.write(f"Model: {stacking_name}\n")
            f.write(f"Stacking Metrics: MAE={stacking_metrics['MAE']} RMSE={stacking_metrics['RMSE']} MAPE={stacking_metrics['MAPE']}% R2={stacking_metrics['R2']}\n")
            f.write(f"Forecast Summary:\n{nlp_report}\n\n-END HEADER-\n\n")
            df_out.to_csv(f, index=False, sep=";")

        with progress_lock:
            generate_progress[username].update({
                "running": False, "done": True,
                "nlp_report": nlp_report, "last_mode": "best", "error": None
            })

    except Exception as e:
        print(f"❌ Worker Best error: {traceback.format_exc()}")
        with progress_lock:
            generate_progress[username].update({
                "running": False, "done": True, "nlp_report": None, "error": str(e)
            })

# =========================
# GENERATE FULL
# =========================
@generate_bp.route(
    "/generate_full",
    methods=["POST"]
)
def generate_full():

    from app import (
        metrics,
        metrics_dl,
        DL_INPUT_COLS
    )

    username = session.get("username")
    
    with progress_lock:

        if generate_progress.get(username, {}).get("running"):

            return jsonify({

                "status": "already_running"

            }), 409

        generate_progress[username] = {

            "running": True,
            "done": False,
            "day": 0,
            "total": 7,
            "start_time": time.time(),
            "error": None,
            "nlp_report": None

        }

    selected_model = request.form.get(
        "model",
        "all"
    )
    
    selected_var = request.form.get("selected_var", "WS10M")  # ← tambah
    print(f"🔍 SELECTED VAR: {selected_var}")  # ← tambah

    all_models = list(metrics.keys()) + list(metrics_dl.keys())

    active_models = (
        get_best_ml_and_dl(metrics, metrics_dl)
        if selected_model == "best"
        else all_models
    )

    threading.Thread(

        target=_worker_generate_full,

        args=(
            username,
            selected_model,
            active_models,
            "general",
            selected_var  # ← tambah
        ),

        daemon=True

    ).start()

    return jsonify({

        "status": "started"

    })
    
#=========================
# GENERATE BEST
# =========================
@generate_bp.route("/generate_best", methods=["POST"])
def generate_best():
    username = session.get("username")
    with progress_lock:
        if generate_progress.get(username, {}).get("running"):
            return jsonify({"status": "already_running"}), 409

        generate_progress[username] = {
            "running": True, "done": False,
            "day": 0, "total": 7,
            "mode": "Best Stacking",
            "start_time": time.time(),
            "error": None, "nlp_report": None
        }

    from app import metrics, metrics_dl
    best_models = get_best_ml_and_dl(metrics, metrics_dl)

    if not best_models:
        return jsonify({"status": "error", "message": "No trained models found"}), 400

    threading.Thread(
        target=_worker_generate_best,
        args=(username,),
        daemon=True
    ).start()

    return jsonify({"status": "started"})

# =========================
# DOWNLOAD
# =========================
@generate_bp.route("/download_full/<mode>")
def download_full(mode):
    from config import OUTPUT_FOLDER
    
    username = session.get("username")

    filename = (
        f"{username}_hasil_prediksi_best.csv"
        if mode == "best"
        else f"{username}_hasil_prediksi_general.csv"
    )
    filepath = os.path.join(OUTPUT_FOLDER, filename)
    
    if os.path.exists(filepath):
        return send_file(filepath, as_attachment=True)

    return "File belum ada", 404
    
@generate_bp.route("/overview_data")
def overview_data():

    return jsonify({

        "nlp_report": session.get("nlp_report", ""),
        "generate_mode": session.get("last_generate_mode", "general")

    })   
    # if os.path.exists(filename):

    #     return send_file(

    #         filename,
    #         as_attachment=True

    #     )

    # return "File belum ada", 404