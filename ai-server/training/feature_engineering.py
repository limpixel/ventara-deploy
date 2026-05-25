import pandas as pd

from config import TARGET

# =========================
# LOAD & FEATURE ENGINEERING
# =========================
def load_and_engineer(
    path: str
) -> pd.DataFrame:

    df = pd.read_csv(path)

    for lag in [1, 2, 3, 24]:
        df[f"lag{lag}"] = df[TARGET].shift(lag)

    df["mean3"] = (
        df[TARGET]
        .rolling(3)
        .mean()
    )

    df["mean24"] = (
        df[TARGET]
        .rolling(24)
        .mean()
    )

    return (
        df
        .dropna()
        .reset_index(drop=True)
    )