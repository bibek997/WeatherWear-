from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier

# config
load_dotenv()
API_KEY = os.getenv("OPENWEATHER_KEY")
if not API_KEY:
    raise RuntimeError("OPENWEATHER_KEY not found in environment")

CSV_PATH = "data/synthetic_60k.csv"
MODEL_PATH = "model/clothing_models.pkl"

CATEGORICAL_COLS = ["gender", "weather_condition", "day_of_week"]
NUMERICAL_COLS = [
    "temperature",
    "humidity",
    "wind_speed",
    "uv_index",
    "feels_like",
    "hour",
]

# global container
MODELS = {}  # {"pipes": dict, "labels": dict}

# FastAPI
app = FastAPI(title="WeatherWear", version="2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# response models
class Outfit(BaseModel):
    topwear: str
    bottomwear: str
    footwear: str
    accessory: str


class OutfitToday(BaseModel):
    temp: float
    humidity: int
    condition: str
    unit: str
    outfit: Outfit
    tip: str


class ForecastDay(BaseModel):
    day: str
    date: str
    high: int
    low: int
    condition: str
    unit: str
    outfit: Outfit
    tip: str


class Settings(BaseModel):
    city: str
    unit: str
    gender: str


# training
def build_pipeline(y_series: pd.Series) -> tuple[Pipeline, LabelEncoder]:
    le = LabelEncoder().fit(y_series)
    pre = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_COLS),
            ("num", "passthrough", NUMERICAL_COLS),
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
                    random_state=42,
                    eval_metric="mlogloss",
                ),
            ),
        ]
    )
    return pipe, le


def train_models():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)

    print("Training models on", CSV_PATH)
    df = pd.read_csv(CSV_PATH)

    pipes = {}
    labels = {}
    for col in ["top_label", "bottom_label", "footwear_label", "accessory_label"]:
        pipe, le = build_pipeline(df[col])
        X = df[CATEGORICAL_COLS + NUMERICAL_COLS]
        y = le.transform(df[col])  # strings -> ints
        pipe.fit(X, y)
        pipes[col] = pipe
        labels[col] = le
        print(f"{col} accuracy: {pipe.score(X, y):.3f}")

    os.makedirs("model", exist_ok=True)
    joblib.dump({"pipes": pipes, "labels": labels}, MODEL_PATH)
    return {"pipes": pipes, "labels": labels}


# inference
def predict_one(
    temp, humidity, condition, wind, uv, feels, hour, dow, gender
) -> Outfit:
    X = pd.DataFrame(
        [
            {
                "gender": gender,
                "weather_condition": condition,
                "temperature": temp,
                "humidity": humidity,
                "wind_speed": wind,
                "uv_index": uv,
                "feels_like": feels,
                "hour": hour,
                "day_of_week": dow,
            }
        ]
    )
    top_id = MODELS["pipes"]["top_label"].predict(X)[0]
    bottom_id = MODELS["pipes"]["bottom_label"].predict(X)[0]
    foot_id = MODELS["pipes"]["footwear_label"].predict(X)[0]
    acc_id = MODELS["pipes"]["accessory_label"].predict(X)[0]

    return Outfit(
        topwear=MODELS["labels"]["top_label"].inverse_transform([top_id])[0],
        bottomwear=MODELS["labels"]["bottom_label"].inverse_transform([bottom_id])[0],
        footwear=MODELS["labels"]["footwear_label"].inverse_transform([foot_id])[0],
        accessory=MODELS["labels"]["accessory_label"].inverse_transform([acc_id])[0],
    )


def generate_tip(temp: float, condition: str, outfit: Outfit) -> str:
    weather = {
        "Clear": "enjoy the sunshine",
        "Clouds": "layer up for changing temps",
        "Rain": "stay dry with waterproof gear",
        "Snow": "bundle up warmly",
        "Thunderstorm": "seek shelter",
    }.get(condition, "dress appropriately")
    return f"Wear {outfit.topwear}, {outfit.bottomwear}, {outfit.footwear} and {outfit.accessory}. {weather}."


# weather
UNITS = {"C": "metric", "F": "imperial"}


def fetch_weather(city: str, unit: str):
    u = UNITS[unit]
    url = (
        "https://api.openweathermap.org/data/2.5/weather"
        f"?q={city}&units={u}&appid={API_KEY}"
    )
    r = requests.get(url, timeout=12)
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="OpenWeather error")
    j = r.json()
    return {
        "temp": round(j["main"]["temp"], 1),
        "humidity": j["main"]["humidity"],
        "condition": j["weather"][0]["main"],
        "wind": j.get("wind", {}).get("speed", 0),
        "uv": 0,
        "feels": round(j["main"]["feels_like"], 1),
        "hour": datetime.utcnow().hour,
        "dow": datetime.utcnow().strftime("%a"),
    }


# endpoints
@app.on_event("startup")
async def startup():
    global MODELS
    MODELS = train_models()


@app.get("/", tags=["health"])
def root():
    return {"message": "WeatherWear ML API v2.0 – synthetic 60 k – see /docs"}


@app.get("/outfit/{city}", response_model=OutfitToday, tags=["outfit"])
def get_outfit(
    city: str,
    gender: str = Query("male", regex="^(male|female|baby)$"),
    unit: str = Query("C", regex="^(C|F)$"),
):
    w = fetch_weather(city, unit)
    outfit = predict_one(**w, gender=gender)
    tip = generate_tip(w["temp"], w["condition"], outfit)
    return OutfitToday(**w, unit=unit, outfit=outfit, tip=tip)


@app.get("/forecast/{city}", response_model=list[ForecastDay], tags=["forecast"])
def three_day_forecast(
    city: str,
    gender: str = Query("male", regex="^(male|female|baby)$"),
    unit: str = Query("C", regex="^(C|F)$"),
):
    u = UNITS[unit]
    url = (
        "https://api.openweathermap.org/data/2.5/forecast"
        f"?q={city}&units={u}&appid={API_KEY}"
    )
    r = requests.get(url, timeout=12)
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="OpenWeather error")
    j = r.json()

    days = []
    base = datetime.utcnow()
    for i in range(3):
        slot = j["list"][i * 8]
        temp = slot["main"]["temp"]
        cond = slot["weather"][0]["main"]
        wind = slot.get("wind", {}).get("speed", 0)
        feels = slot["main"]["feels_like"]
        date = (base + timedelta(days=i)).strftime("%Y-%m-%d")
        outfit = predict_one(
            temp, slot["main"]["humidity"], cond, wind, 0, feels, 12, "Mon", gender
        )
        tip = generate_tip(temp, cond, outfit)
        days.append(
            ForecastDay(
                day=["Today", "Tomorrow", "Day 3"][i],
                date=date,
                high=int(round(temp + 1)),
                low=int(round(temp - 1)),
                condition=cond,
                unit=unit,
                outfit=outfit,
                tip=tip,
            )
        )
    return days


@app.post("/settings", tags=["settings"])
def save_settings(body: Settings):
    return body
