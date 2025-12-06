# import os
# import pandas as pd
# import numpy as np
# import joblib
# import matplotlib.pyplot as plt
# import seaborn as sns
# from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
# import requests
# import time

# # ---------------- CONFIG ----------------
# CSV_PATH = "data/synthetic_30k.csv"
# MODEL_DIR = "models"
# OUTPUT_DIR = "figures"
# FEAT_COLS = [
#     "temperature",
#     "humidity",
#     "wind_speed",
#     "rain",
#     "gender",
#     "hour",
#     "day_of_week",
#     "season",
#     "weather_condition",
# ]
# TARGETS = ["top", "bottom", "footwear", "accessory"]
# API_TEST_URL = "http://localhost:8000/outfit/London?gender=male&unit=C"

# os.makedirs(OUTPUT_DIR, exist_ok=True)

# # ---------------- LOAD DATA ----------------
# df = pd.read_csv(CSV_PATH)

# # Load global encoders and preprocessor (preprocessor included in pipeline, optional)
# label_encoders = joblib.load(os.path.join(MODEL_DIR, "global_label_encoders.pkl"))

# # Load individual models (pipelines include preprocessor)
# models = {
#     t: joblib.load(os.path.join(MODEL_DIR, f"{t}_label_model.pkl")) for t in TARGETS
# }

# # ---------------- 1. Accuracy Table ----------------
# acc_list = []
# for tgt in TARGETS:
#     le = label_encoders[f"{tgt}_label"]
#     model = models[tgt]
#     X = df[FEAT_COLS]  # raw features only
#     y_true = le.transform(df[f"{tgt}_label"])
#     y_pred = model.predict(X)  # pipeline applies preprocessing internally
#     acc_list.append(
#         {"Garment": tgt.title(), "Accuracy": round(accuracy_score(y_true, y_pred), 3)}
#     )

# acc_df = pd.DataFrame(acc_list)
# acc_df.to_csv(os.path.join(OUTPUT_DIR, "accuracy_table.csv"), index=False)
# print("✔ Accuracy table saved")

# # ---------------- 2. Confusion Matrices ----------------
# for tgt in TARGETS:
#     le = label_encoders[f"{tgt}_label"]
#     model = models[tgt]
#     X = df[FEAT_COLS]
#     y_true = le.transform(df[f"{tgt}_label"])
#     y_pred = model.predict(X)
#     cm = confusion_matrix(y_true, y_pred)

#     plt.figure(figsize=(7, 6))
#     sns.heatmap(
#         cm,
#         annot=True,
#         fmt="d",
#         cmap="Blues",
#         xticklabels=le.classes_,
#         yticklabels=le.classes_,
#     )
#     plt.title(f"{tgt.title()} Confusion Matrix")
#     plt.xlabel("Predicted")
#     plt.ylabel("Actual")
#     plt.tight_layout()
#     plt.savefig(os.path.join(OUTPUT_DIR, f"cm_{tgt}.png"), dpi=300)
#     plt.close()
# print("✔ Confusion matrices saved")

# # ---------------- 3. Precision / Recall / F1 Bar Chart ----------------
# metrics_list = []
# for tgt in TARGETS:
#     le = label_encoders[f"{tgt}_label"]
#     model = models[tgt]
#     X = df[FEAT_COLS]
#     y_true = le.transform(df[f"{tgt}_label"])
#     y_pred = model.predict(X)
#     report = classification_report(y_true, y_pred, output_dict=True)
#     metrics_list.append(pd.DataFrame(report).transpose().assign(Garment=tgt.title()))

# metrics_df = pd.concat(metrics_list)
# pivot = metrics_df.groupby("Garment")[["precision", "recall", "f1-score"]].mean()
# pivot.plot(kind="bar", figsize=(10, 5))
# plt.title("Average Precision / Recall / F1 per Garment Type")
# plt.ylabel("Score")
# plt.ylim(0, 1)
# plt.tight_layout()
# plt.savefig(os.path.join(OUTPUT_DIR, "prf1_bar.png"), dpi=300)
# plt.close()
# print("✔ PRF1 bar chart saved")

# # ---------------- 4. Dataset Feature Distribution ----------------
# # Weather condition distribution
# plt.figure(figsize=(6, 4))
# sns.countplot(x="weather_condition", data=df, palette="pastel", dodge=False)
# plt.title("Weather Condition Distribution")
# plt.tight_layout()
# plt.savefig(os.path.join(OUTPUT_DIR, "weather_condition_dist.png"), dpi=300)
# plt.close()

# # Rain distribution
# plt.figure(figsize=(6, 4))
# sns.countplot(x="rain", data=df, palette="cool", dodge=False)
# plt.title("Rain Occurrence Distribution")
# plt.tight_layout()
# plt.savefig(os.path.join(OUTPUT_DIR, "rain_dist.png"), dpi=300)
# plt.close()

# # Gender distribution
# plt.figure(figsize=(6, 4))
# sns.countplot(x="gender", data=df, palette="Set2", dodge=False)
# plt.title("Gender Distribution")
# plt.tight_layout()
# plt.savefig(os.path.join(OUTPUT_DIR, "gender_dist.png"), dpi=300)
# plt.close()

# # Day of week distribution
# plt.figure(figsize=(7, 4))
# sns.countplot(
#     x="day_of_week",
#     data=df,
#     palette="muted",
#     order=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
#     dodge=False,
# )
# plt.title("Day of Week Distribution")
# plt.tight_layout()
# plt.savefig(os.path.join(OUTPUT_DIR, "day_of_week_dist.png"), dpi=300)
# plt.close()

# # Garment label distributions
# for tgt in TARGETS:
#     plt.figure(figsize=(8, 4))
#     sns.countplot(
#         x=f"{tgt}_label",
#         data=df,
#         order=df[f"{tgt}_label"].value_counts().index,
#         palette="Set3",
#         dodge=False,
#     )
#     plt.title(f"{tgt.title()} Label Distribution")
#     plt.xticks(rotation=45)
#     plt.tight_layout()
#     plt.savefig(os.path.join(OUTPUT_DIR, f"{tgt}_label_dist.png"), dpi=300)
#     plt.close()
# print("✔ Dataset distribution plots saved")

# # ---------------- 5. API Latency Histogram ----------------
# latencies = []
# for _ in range(50):
#     start = time.perf_counter()
#     try:
#         requests.get(API_TEST_URL)
#     except Exception as e:
#         print("⚠ API call failed:", e)
#     end = time.perf_counter()
#     latencies.append(end - start)

# lat_series = pd.Series(latencies, name="Seconds")
# lat_series.plot(kind="hist", bins=12, color="skyblue", edgecolor="black")
# plt.title("API Response Time (50 calls)")
# plt.xlabel("Seconds")
# plt.ylabel("Frequency")
# plt.tight_layout()
# plt.savefig(os.path.join(OUTPUT_DIR, "latency_hist.png"), dpi=300)
# plt.close()
# print("✔ API latency histogram saved")

# print(f"All figures saved in {OUTPUT_DIR}")

# generate_figures.py
import os
import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import requests
import time

# ---------------- CONFIG ----------------
CSV_PATH = "data/synthetic_30k.csv"
MODEL_DIR = "models"
OUTPUT_DIR = "figures"
API_TEST_URL = "http://localhost:8000/outfit/London?gender=male&unit=C"

TARGETS = ["top", "bottom", "footwear", "accessory"]
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------- LOAD DATA & MODELS ----------------
df = pd.read_csv(CSV_PATH)

# Load label encoders and individual models
label_encoders = joblib.load(os.path.join(MODEL_DIR, "global_label_encoders.pkl"))
models = {
    t: joblib.load(os.path.join(MODEL_DIR, f"{t}_label_model.pkl")) for t in TARGETS
}

# Get raw feature columns used in preprocessor
preprocessor = joblib.load(os.path.join(MODEL_DIR, "preprocessor.pkl"))
FEATURE_COLS = preprocessor.feature_names_in_

# ---------------- 1. ACCURACY TABLE & BAR CHART ----------------
acc_list = []
for tgt in TARGETS:
    le = label_encoders[tgt + "_label"]
    model = models[tgt]
    X = df[FEATURE_COLS]  # raw features
    y_true = df[tgt + "_label"]
    y_true_encoded = le.transform(y_true)
    y_pred_encoded = model.predict(X)
    acc = accuracy_score(y_true_encoded, y_pred_encoded)
    acc_list.append({"Garment": tgt.title(), "Accuracy": acc})

acc_df = pd.DataFrame(acc_list)
acc_df.to_csv(os.path.join(OUTPUT_DIR, "accuracy_table.csv"), index=False)
print("✔ Accuracy table saved")

# Plot accuracy bar chart
plt.figure(figsize=(8, 5))
sns.barplot(x="Garment", y="Accuracy", data=acc_df, palette="pastel")
plt.ylim(0, 1)
plt.title("Model Accuracy per Garment")
plt.ylabel("Accuracy")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "accuracy_bar.png"), dpi=300)
plt.close()
print("✔ Accuracy bar chart saved")

# ---------------- 2. CONFUSION MATRICES ----------------
for tgt in TARGETS:
    le = label_encoders[tgt + "_label"]
    model = models[tgt]
    X = df[FEATURE_COLS]
    y_true_encoded = le.transform(df[tgt + "_label"])
    y_pred_encoded = model.predict(X)
    cm = confusion_matrix(y_true_encoded, y_pred_encoded)

    plt.figure(figsize=(7, 6))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=le.classes_,
        yticklabels=le.classes_,
    )
    plt.title(f"{tgt.title()} Confusion Matrix")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, f"cm_{tgt}.png"), dpi=300)
    plt.close()
print("✔ Confusion matrices saved")

# ---------------- 3. PRECISION / RECALL / F1 BAR CHART ----------------
metrics_list = []
for tgt in TARGETS:
    le = label_encoders[tgt + "_label"]
    model = models[tgt]
    X = df[FEATURE_COLS]
    y_true_encoded = le.transform(df[tgt + "_label"])
    y_pred_encoded = model.predict(X)
    report = classification_report(y_true_encoded, y_pred_encoded, output_dict=True)
    metrics_list.append(pd.DataFrame(report).transpose().assign(Garment=tgt.title()))

metrics_df = pd.concat(metrics_list)
pivot = metrics_df.groupby("Garment")[["precision", "recall", "f1-score"]].mean()
pivot.plot(kind="bar", figsize=(10, 5))
plt.title("Average Precision / Recall / F1 per Garment Type")
plt.ylabel("Score")
plt.ylim(0, 1)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "prf1_bar.png"), dpi=300)
plt.close()
print("✔ PRF1 bar chart saved")

# ---------------- 4. DISTRIBUTION FIGURES ----------------
plt.figure(figsize=(7, 5))
sns.countplot(x="weather_condition", data=df, palette="pastel")
plt.title("Weather Condition Distribution")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "weather_condition_dist.png"), dpi=300)
plt.close()

plt.figure(figsize=(7, 5))
sns.countplot(x="rain", data=df, palette="cool")
plt.title("Rain Distribution")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "rain_dist.png"), dpi=300)
plt.close()

plt.figure(figsize=(7, 5))
sns.countplot(x="gender", data=df, palette="Set2")
plt.title("Gender Distribution")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "gender_dist.png"), dpi=300)
plt.close()

plt.figure(figsize=(10, 5))
sns.countplot(
    x="day_of_week",
    data=df,
    order=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    palette="muted",
)
plt.title("Day of Week Distribution")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "day_of_week_dist.png"), dpi=300)
plt.close()

# ---------------- 5. MODEL LABEL DISTRIBUTION ----------------
for tgt in TARGETS:
    plt.figure(figsize=(10, 5))
    sns.countplot(
        x=f"{tgt}_label",
        data=df,
        order=df[f"{tgt}_label"].value_counts().index,
        palette="Set3",
    )
    plt.title(f"{tgt.title()} Label Distribution")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, f"{tgt}_label_dist.png"), dpi=300)
    plt.close()

# ---------------- 6. API LATENCY HISTOGRAM ----------------
latencies = []
for _ in range(50):
    start = time.perf_counter()
    try:
        requests.get(API_TEST_URL)
    except Exception as e:
        print("⚠ API call failed:", e)
    end = time.perf_counter()
    latencies.append(end - start)

lat_series = pd.Series(latencies, name="Seconds")
lat_series.plot(kind="hist", bins=12, color="skyblue", edgecolor="black")
plt.title("API Response Time (50 calls)")
plt.xlabel("Seconds")
plt.ylabel("Frequency")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "latency_hist.png"), dpi=300)
plt.close()
print("✔ API latency histogram saved")

print(f"\nAll figures generated in: {OUTPUT_DIR}")
