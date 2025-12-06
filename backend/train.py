import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier
from sklearn.metrics import classification_report

# Load synthetic dataset
data = pd.read_csv("data/synthetic_30k.csv")
print("Loaded dataset:", data.shape)

# Features & Labels
features = [
    "temperature",
    "humidity",
    "wind_speed",
    "rain",
    "gender",
    "hour",
    "day_of_week",
    "season",
    "weather_condition",
]
labels = ["top_label", "bottom_label", "footwear_label", "accessory_label"]

X = data[features].copy()
y = {lbl: data[lbl] for lbl in labels}

# small noise to numeric features
np.random.seed(42)
X["temperature"] = X["temperature"] + np.random.normal(0, 0.5, size=len(X))
X["humidity"] = X["humidity"] + np.random.normal(0, 1, size=len(X))
X["wind_speed"] = X["wind_speed"] + np.random.normal(0, 0.2, size=len(X))

# Encode categorical features
cat_features = ["gender", "day_of_week", "season", "weather_condition"]
num_features = ["temperature", "humidity", "wind_speed", "rain", "hour"]

preprocessor = ColumnTransformer(
    [
        ("cat", OneHotEncoder(handle_unknown="ignore"), cat_features),
    ],
    remainder="passthrough",
)

# Label encoders for each target
label_encoders = {}
for lbl in labels:
    le = LabelEncoder()
    y[lbl] = le.fit_transform(y[lbl])
    label_encoders[lbl] = le
print("Label encoders created")

# Save encoders for app use
with open("models/global_label_encoders.pkl", "wb") as f:
    pickle.dump(label_encoders, f)
print("Saved label encoders → models/global_label_encoders.pkl")

# Train models for each label
trained_models = {}
for lbl in labels:
    print(f"\nTraining {lbl}...")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y[lbl], test_size=0.2, random_state=42, stratify=y[lbl]
    )

    # Pipeline with XGBoost
    pipe = Pipeline(
        [
            ("preprocessor", preprocessor),
            (
                "classifier",
                XGBClassifier(
                    n_estimators=150,
                    max_depth=3,  # shallower tree for generalization
                    learning_rate=0.1,
                    gamma=1,  # regularization
                    min_child_weight=2,  # prevent overfitting small leaves
                    subsample=0.8,  # row sampling
                    colsample_bytree=0.8,  # column sampling
                    eval_metric="mlogloss",
                    random_state=42,
                ),
            ),
        ]
    )

    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    print(classification_report(y_test, y_pred))

    # Save pipeline
    model_path = f"models/{lbl}_model.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(pipe, f)
    trained_models[lbl] = pipe
    print(f"{lbl} model saved → {model_path}")

# Save preprocessor separately
with open("models/preprocessor.pkl", "wb") as f:
    pickle.dump(preprocessor, f)
print("Preprocessor saved → models/preprocessor.pkl")
