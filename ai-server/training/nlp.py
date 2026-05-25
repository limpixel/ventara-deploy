import pandas as pd

from config import TARGET

def get_best_ml_and_dl(
    m_ml: dict,
    m_dl: dict
) -> list:

    if not m_ml:
        return []

    best_ml = min(
        m_ml,
        key=lambda m: m_ml[m]["MAPE"]
    )

    result = [best_ml]

    if m_dl:

        best_dl = min(
            m_dl,
            key=lambda m: m_dl[m]["MAPE"]
        )

        result.append(best_dl)

    return result

def build_forecast_text(
    df_future: pd.DataFrame,
    TARGET: str
) -> dict:

    avg = float(
        df_future[TARGET].mean()
    )

    max_val = float(
        df_future[TARGET].max()
    )

    min_val = float(
        df_future[TARGET].min()
    )

    std_val = float(
        df_future[TARGET].std()
    )

    hourly = df_future.groupby("HR")[TARGET].mean()

    peak_hr = int(hourly.idxmax())
    low_hr  = int(hourly.idxmin())

    start_row = df_future.iloc[0]
    end_row   = df_future.iloc[-1]

    start_date = (
        f"{int(start_row['DY']):02d}-"
        f"{int(start_row['MO']):02d}-"
        f"{int(start_row['YEAR'])}"
    )

    end_date = (
        f"{int(end_row['DY']):02d}-"
        f"{int(end_row['MO']):02d}-"
        f"{int(end_row['YEAR'])}"
    )

    split_idx = len(df_future) // 2

    first_half = float(
        df_future.iloc[:split_idx][TARGET].mean()
    )

    second_half = float(
        df_future.iloc[split_idx:][TARGET].mean()
    )

    if second_half > first_half + 0.1:
        trend = "meningkat menuju akhir periode"

    elif second_half < first_half - 0.1:
        trend = "menurun menuju akhir periode"

    else:
        trend = "relatif stabil sepanjang periode"

    if avg < 1.5:
        category = "tenang (calm)"

    elif avg < 3.3:
        category = "angin sepoi ringan"

    elif avg < 5.5:
        category = "angin sedang"

    elif avg < 8.0:
        category = "angin segar"

    else:
        category = "angin kencang"

    return {
        "avg": avg,
        "max_val": max_val,
        "min_val": min_val,
        "std_val": std_val,
        "peak_hr": peak_hr,
        "low_hr": low_hr,
        "trend": trend,
        "category": category,
        "start_date": start_date,
        "end_date": end_date
    }
    
def generate_nlp_report(
    stats: dict,
    best_model_name: str,
    best_met: dict
) -> str:

    mape_raw = str(
        best_met.get("MAPE", "-")
    ).replace(",", ".").replace("%", "").strip()

    rmse_raw = str(
        best_met.get("RMSE", "-")
    ).replace(",", ".").strip()

    if mape_raw.lower() in (
        "-",
        "",
        "nan",
        "none"
    ):

        mape_str = "N/A"
        akurasi  = "tidak tersedia"

    else:

        mape = float(mape_raw)

        mape_str = f"{mape:.2f}%"

        if mape < 10:
            akurasi = "tinggi"

        elif mape < 20:
            akurasi = "cukup"

        else:
            akurasi = "rendah"

    rmse_str = (
        "N/A"
        if rmse_raw.lower() in (
            "-",
            "",
            "nan",
            "none"
        )
        else rmse_raw
    )

    return (
        f"Prediksi kecepatan angin untuk periode "
        f"{stats['start_date']} hingga {stats['end_date']} "
        f"menunjukkan rata-rata {stats['avg']:.2f} m/s, "
        f"termasuk kategori {stats['category']}. "

        f"Kecepatan tertinggi mencapai "
        f"{stats['max_val']:.2f} m/s "
        f"dan terendah {stats['min_val']:.2f} m/s, "
        f"dengan standar deviasi "
        f"{stats['std_val']:.2f} m/s. "

        f"Angin cenderung paling kuat sekitar pukul "
        f"{stats['peak_hr']:02d}:00 "
        f"dan paling lemah sekitar pukul "
        f"{stats['low_hr']:02d}:00. "

        f"Secara umum tren angin "
        f"{stats['trend']}. "

        f"\n\nModel terbaik adalah "
        f"{best_model_name} "
        f"dengan MAPE {mape_str} "
        f"dan RMSE {rmse_str}. "

        f"Tingkat akurasi model tergolong "
        f"{akurasi}."
    )