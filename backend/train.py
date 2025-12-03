import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report

df = pd.read_csv("data/synthetic_60k.csv")

num_cols = ["temperature", "humidity", "wind_speed", "uv_index", "feels_like", "hour"]
cat_cols = ["weather_condition", "gender", "day_of_week"]
label_cols = ["top_label", "bottom_label", "footwear_label", "accessory_label"]

# PREPROCESSOR (shared by all)
preprocess = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), num_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
    ]
)

models = {}  # store 4 label models
encoders = {}  # store 4 LabelEncoders
accuracies = {}  # store accuracy of each model

print("=== TRAINING XGBOOST MODELS ==========\n")

for col in label_cols:
    print(f"\nTraining {col} …")

    # Encode target labels
    le = LabelEncoder()
    y = le.fit_transform(df[col])
    encoders[col] = le

    X_train, X_test, y_train, y_test = train_test_split(
        df[num_cols + cat_cols], y, test_size=0.2, random_state=42, stratify=y
    )

    pipe = Pipeline(
        [
            ("prep", preprocess),
            (
                "clf",
                XGBClassifier(
                    n_estimators=600,
                    learning_rate=0.05,
                    max_depth=6,
                    min_child_weight=3,
                    subsample=0.8,
                    colsample_bytree=0.7,
                    gamma=0.1,
                    reg_alpha=0.2,
                    reg_lambda=1.0,
                    objective="multi:softprob",
                    eval_metric="mlogloss",
                    random_state=42,
                    n_jobs=-1,
                ),
            ),
        ]
    )

    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    accuracies[col] = acc

    print(f"{col:20} | accuracy = {acc:.3f}")

    print(
        classification_report(
            le.inverse_transform(y_test),
            le.inverse_transform(y_pred),
            zero_division=0,
        )
    )

    print("-" * 70)

    # SAVE MODEL
    models[col] = pipe

# SAVE EVERYTHING
os.makedirs("model", exist_ok=True)

joblib.dump(models, "model/clothing_models.pkl")
joblib.dump(encoders, "model/encoders.pkl")
joblib.dump(preprocess, "model/preprocess.pkl")
joblib.dump(accuracies, "model/accuracies.pkl")

print("\nSaved → model/")
print("Final accuracies:", accuracies)
