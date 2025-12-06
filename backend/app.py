import os
import pickle
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import pandas as pd
from dotenv import load_dotenv

load_dotenv()
# FastAPI instance
app = FastAPI(title="WeatherWear")

# Weather API
OPENWEATHER_KEY = os.getenv("OPENWEATHER_KEY")
if not OPENWEATHER_KEY:
    raise RuntimeError("OPENWEATHER_KEY not set in .env")

WEATHER_URL_CURRENT = "http://api.openweathermap.org/data/2.5/weather"
WEATHER_URL_FORECAST = "http://api.openweathermap.org/data/2.5/forecast"

# Load models & encoders
MODEL_PATHS = {
    "top_label": "models/top_label_model.pkl",
    "bottom_label": "models/bottom_label_model.pkl",
    "footwear_label": "models/footwear_label_model.pkl",
    "accessory_label": "models/accessory_label_model.pkl",
}

MODELS = {}
for key, path in MODEL_PATHS.items():
    if not os.path.exists(path):
        raise FileNotFoundError(f"{path} not found")
    with open(path, "rb") as f:
        MODELS[key] = pickle.load(f)

with open("models/global_label_encoders.pkl", "rb") as f:
    LABEL_ENCODERS = pickle.load(f)

with open("models/preprocessor.pkl", "rb") as f:
    PREPROCESSOR = pickle.load(f)

print("Models, encoders, preprocessor loaded successfully.")


# API Input schema
class OutfitRequest(BaseModel):
    city: str
    gender: str = "male"  # male/female/baby
    unit: str = "C"  # C or F


# Helper: Determine season
def get_season(timestamp=None):
    if not timestamp:
        month = pd.Timestamp.now().month
    else:
        month = pd.to_datetime(timestamp, unit="s").month
    if month in [12, 1, 2]:
        return "Winter"
    elif month in [3, 4, 5]:
        return "Spring"
    elif month in [6, 7, 8]:
        return "Summer"
    else:
        return "Autumn"


# Helper: Fetch current weather
def fetch_weather(city: str, unit: str):
    units = "metric" if unit.upper() == "C" else "imperial"
    params = {"q": city, "appid": OPENWEATHER_KEY, "units": units}
    r = requests.get(WEATHER_URL_CURRENT, params=params)
    if r.status_code != 200:
        raise HTTPException(status_code=404, detail="City not found")
    data = r.json()
    weather = {
        "temperature": data["main"]["temp"],
        "feels_like": data["main"].get("feels_like", data["main"]["temp"]),
        "humidity": data["main"]["humidity"],
        "pressure": data["main"].get("pressure", 1013),
        "wind_speed": data["wind"]["speed"],
        "visibility": data.get("visibility", 10000),
        "weather_condition": data["weather"][0]["main"],
        "rain": 1 if data["weather"][0]["main"] in ["Rain", "Thunderstorm"] else 0,
        "season": get_season(data.get("dt", None)),
    }
    return weather


# Helper: Predict outfit
def predict_outfit(weather, gender):
    df = pd.DataFrame(
        [
            {
                "temperature": weather["temperature"],
                "humidity": weather["humidity"],
                "wind_speed": weather["wind_speed"],
                "rain": weather["rain"],
                "gender": gender,
                "hour": 12,
                "day_of_week": "Mon",
                "season": weather["season"],
                "weather_condition": weather["weather_condition"],
            }
        ]
    )
    outfit = {}
    for lbl, model in MODELS.items():
        pred = model.predict(df)[0]
        pred_label = LABEL_ENCODERS[lbl].inverse_transform([pred])[0]
        outfit[lbl.replace("_label", "")] = pred_label

    # Add tips
    outfit["tips"] = generate_tips_from_outfit(outfit, gender, weather)
    return outfit


# Generate tips
def generate_tips_from_outfit(outfit, gender, weather):
    tips = []
    temp = weather["temperature"]
    top = outfit.get("top", "").lower()
    bottom = outfit.get("bottom", "").lower()
    footwear = outfit.get("footwear", "").lower()
    accessory = outfit.get("accessory", "").lower()

    if any(
        k in top for k in ["puffer", "parka", "coat", "raincoat", "thermal", "hoodie"]
    ):
        tips.append(f"Consider wearing {top} to stay warm.")
    elif any(k in top for k in ["tshirt", "tank", "blouse", "shirt"]):
        tips.append(f"{top.capitalize()} is fine for mild weather.")

    if "skirt" in bottom and gender != "female":
        tips.append(f"{bottom} may be chilly for {gender}.")
    elif "shorts" in bottom and temp < 20:
        tips.append("Shorts may be too cold.")
    else:
        tips.append(f"{bottom} is suitable.")

    if "boots" in footwear and weather["rain"]:
        tips.append("Wear waterproof boots to keep feet dry.")
    elif "sandals" in footwear or "flip" in footwear:
        tips.append("Sandals/flipflops are suitable for hot weather.")
    else:
        tips.append(f"{footwear} are comfortable for daily use.")

    if "umbrella" in accessory or "raincoat" in accessory:
        tips.append("Carry an umbrella or wear waterproof clothing.")
    if "scarf" in accessory or "gloves" in accessory or "hat" in accessory:
        tips.append("Consider adding accessories to stay warm.")

    return tips


# /outfit endpoint (current weather)
@app.get("/outfit/{city}")
def get_outfit(city: str, gender: str = "male", unit: str = "C"):
    weather = fetch_weather(city, unit)
    outfit = predict_outfit(weather, gender)
    return {
        "city": city,
        "gender": gender,
        "temperature": weather["temperature"],
        "feels_like": weather["feels_like"],
        "humidity": weather["humidity"],
        "wind_speed": weather["wind_speed"],
        "pressure": weather["pressure"],
        "visibility": weather["visibility"],
        "weather_condition": weather["weather_condition"],
        "season": weather["season"],
        "outfit": outfit,
    }


# /forecast endpoint (next 3 days)
@app.get("/forecast/{city}")
def get_forecast(city: str, gender: str = "male", unit: str = "C"):
    units = "metric" if unit.upper() == "C" else "imperial"
    params = {"q": city, "appid": OPENWEATHER_KEY, "units": units}
    r = requests.get(WEATHER_URL_FORECAST, params=params)
    if r.status_code != 200:
        raise HTTPException(status_code=404, detail="City not found")

    data = r.json()
    results = []
    # OpenWeather 3-hourly forecast, pick 1 forecast per day (skip today)
    dates_seen = set()
    for item in data["list"]:
        dt_txt = item["dt_txt"]
        date = dt_txt.split(" ")[0]
        if date in dates_seen:
            continue
        dates_seen.add(date)
        if len(results) >= 3:
            break
        # Skip today
        today = pd.Timestamp.now().strftime("%Y-%m-%d")
        if date <= today:
            continue

        weather = {
            "temperature": item["main"]["temp"],
            "feels_like": item["main"]["feels_like"],
            "humidity": item["main"]["humidity"],
            "pressure": item["main"]["pressure"],
            "wind_speed": item["wind"]["speed"],
            "visibility": item.get("visibility", 10000),
            "weather_condition": item["weather"][0]["main"],
            "rain": 1 if item["weather"][0]["main"] in ["Rain", "Thunderstorm"] else 0,
            "season": get_season(pd.to_datetime(item["dt"], unit="s")),
        }
        outfit = predict_outfit(weather, gender)
        results.append({"date": date, "weather": weather, "outfit": outfit})

    return results
