"""
Offline accuracy check – uses the same 60 k CSV and same pipeline as app.py
"""

import pandas as pd
import joblib
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report
from xgboost import XGBClassifier

CSV_PATH = "data/synthetic_60k.csv"
RANDOM_STATE = 42

CATEGORICAL = ["gender", "weather_condition", "day_of_week"]
NUMERICAL = ["temperature", "humidity", "wind_speed", "uv_index", "feels_like", "hour"]

TARGETS = ["top_label", "bottom_label", "footwear_label", "accessory_label"]


def build_pipeline(X_train, y_train):
    le = LabelEncoder().fit(y_train)
    pre = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL),
            ("num", "passthrough", NUMERICAL),
        ]
    )
    pipe = Pipeline(
        steps=[
            ("prep", pre),
            (
                "clf",
                XGBClassifier(
                    n_estimators=300,
                    max_depth=6,
                    learning_rate=0.1,
                    subsample=0.8,
                    colsample_bytree=0.8,
                    random_state=RANDOM_STATE,
                    eval_metric="mlogloss",
                    verbosity=0,
                ),
            ),
        ]
    )
    return pipe, le


def main():
    df = pd.read_csv(CSV_PATH)
    X = df[CATEGORICAL + NUMERICAL]

    scores = {}
    for target in TARGETS:
        y = df[target]
        pipe, le = build_pipeline(X, y)
        y_int = le.transform(y)
        pipe.fit(X, y_int)
        y_pred_int = pipe.predict(X)
        y_pred = le.inverse_transform(y_pred_int)

        acc = accuracy_score(y, y_pred)
        scores[target] = acc
        print(f"{target:15s} :  {acc:.3f}")

    micro_avg = sum(scores.values()) / len(scores)
    print("-" * 30)
    print(f"Micro-average :  {micro_avg:.3f}")

    # optional: full report for one category
    print("\nDetailed report for", TARGETS[0])
    print(classification_report(y, y_pred, zero_division=0))


if __name__ == "__main__":
    main()
