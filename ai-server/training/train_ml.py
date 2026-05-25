import joblib
import numpy as np

from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.neighbors import KNeighborsRegressor

import xgboost as xgb_lib

from config import MODEL_FOLDER

def train_ml_models(
    X,
    y,
    features
):

    # =========================
    # GBR
    # =========================
    gbr = GradientBoostingRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=4,
        random_state=42
    )

    gbr.fit(X, y)

    joblib.dump(
        gbr,
        f"{MODEL_FOLDER}/gbr.pkl"
    )

    # =========================
    # XGB
    # =========================
    xgb = xgb_lib.XGBRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=5,
        random_state=42,
        verbosity=0
    )

    xgb.fit(X, y)

    joblib.dump(
        xgb,
        f"{MODEL_FOLDER}/xgb.pkl"
    )

    # =========================
    # KNN
    # =========================
    scaler = MinMaxScaler()

    X_knn = scaler.fit_transform(X)

    knn = KNeighborsRegressor(
        n_neighbors=5,
        metric="euclidean"
    )

    knn.fit(X_knn, y)

    joblib.dump(
        knn,
        f"{MODEL_FOLDER}/knn.pkl"
    )

    joblib.dump(
        scaler,
        f"{MODEL_FOLDER}/scaler.pkl"
    )

    joblib.dump(
        features,
        f"{MODEL_FOLDER}/features.pkl"
    )

    return (
        gbr,
        xgb,
        knn,
        scaler
    )