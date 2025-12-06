import os
import pickle
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import requests
import pandas as pd
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

app = FastAPI(title="WeatherWear")

# OpenWeather keys / URLs
OPENWEATHER_KEY = os.getenv("OPENWEATHER_KEY")
if not OPENWEATHER_KEY:
    raise RuntimeError("OPENWEATHER_KEY not set in .env")

CURRENT_WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather"
FORECAST_WEATHER_URL = "http://api.openweathermap.org/data/2.5/forecast"

# Models & artifacts
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


# ---------- Utilities ----------
def c_to_f(c):
    return c * 9.0 / 5.0 + 32.0


def f_to_c(f):
    return (f - 32.0) * 5.0 / 9.0


def get_season(timestamp=None):
    if not timestamp:
        month = pd.Timestamp.now().month
    else:
        month = pd.to_datetime(timestamp, unit="s").month
    if month in [12, 1, 2]:
        return "Winter"
    if month in [3, 4, 5]:
        return "Spring"
    if month in [6, 7, 8]:
        return "Summer"
    return "Autumn"


# ---------- Weather fetchers ----------
def fetch_current_weather_for_model(city: str):
    """
    Fetch current weather in METRIC units (Celsius). Return dict used as model input.
    This function ALWAYS uses metric so model inputs are stable.
    """
    params = {"q": city, "appid": OPENWEATHER_KEY, "units": "metric"}
    r = requests.get(CURRENT_WEATHER_URL, params=params, timeout=10)
    if r.status_code != 200:
        raise HTTPException(
            status_code=r.status_code,
            detail=r.json().get("message", "Weather API error"),
        )
    data = r.json()
    w = {
        "temperature_c": float(data["main"]["temp"]),
        "feels_like_c": float(data["main"].get("feels_like", data["main"]["temp"])),
        "humidity": int(data["main"]["humidity"]),
        "pressure": int(data["main"].get("pressure", 1013)),
        "wind_speed": float(data["wind"].get("speed", 0.0)),
        "visibility": int(data.get("visibility", 10000)),
        "weather_condition": data["weather"][0]["main"],
        "rain": 1 if data["weather"][0]["main"] in ["Rain", "Thunderstorm"] else 0,
        "timestamp": data.get("dt"),
        "season": get_season(data.get("dt")),
    }
    return w


def fetch_forecast_days(city: str, days: int = 3):
    """
    Fetch 5-day/3-hour forecast from OpenWeather (metric). Aggregate to calendar days,
    return list of daily aggregates (date, temp_c, humidity, wind_speed, condition, rain_flag).
    Excludes today and returns next `days` calendar days.
    """
    params = {"q": city, "appid": OPENWEATHER_KEY, "units": "metric"}
    r = requests.get(FORECAST_WEATHER_URL, params=params, timeout=10)
    if r.status_code != 200:
        raise HTTPException(
            status_code=r.status_code,
            detail=r.json().get("message", "Forecast API error"),
        )
    data = r.json()
    df = pd.DataFrame(
        [
            {
                "dt": item["dt"],
                "dt_txt": item["dt_txt"],
                "temp": item["main"]["temp"],
                "feels_like": item["main"].get("feels_like", item["main"]["temp"]),
                "humidity": item["main"]["humidity"],
                "wind_speed": item["wind"]["speed"],
                "condition": item["weather"][0]["main"],
                "rain": (
                    1
                    if any(k in item and item[k] for k in ("rain",))
                    or item["weather"][0]["main"] in ["Rain", "Thunderstorm"]
                    else 0
                ),
            }
            for item in data.get("list", [])
        ]
    )
    if df.empty:
        raise HTTPException(status_code=500, detail="Empty forecast data")

    df["date"] = pd.to_datetime(df["dt_txt"]).dt.date
    today = pd.Timestamp.now().date()

    # exclude today; keep next calendar days
    df_future = df[df["date"] > today]

    if df_future.empty:
        # sometimes forecast has same-day only — fallback: include today+next two 3-hour buckets
        df_future = df

    days_agg = []
    # get up to `days` unique dates (next days)
    unique_dates = sorted(df_future["date"].unique())[:days]
    for d in unique_dates:
        sub = df_future[df_future["date"] == d]
        days_agg.append(
            {
                "date": str(d),
                "temp_c": float(sub["temp"].mean()),
                "feels_like_c": float(sub["feels_like"].mean()),
                "humidity": float(sub["humidity"].mean()),
                "wind_speed": float(sub["wind_speed"].mean()),
                "condition": (
                    sub["condition"].mode()[0]
                    if not sub["condition"].mode().empty
                    else sub["condition"].iloc[0]
                ),
                "rain": int(sub["rain"].max() > 0),
                "timestamp": int(sub["dt"].iloc[0]),
                "season": get_season(int(sub["dt"].iloc[0])),
            }
        )
    return days_agg


# ---------- Prediction ----------
def construct_model_df_row(
    temp_c,
    humidity,
    wind_speed,
    rain,
    gender,
    hour=12,
    day_of_week="Mon",
    season="Spring",
    condition="Clear",
):
    return pd.DataFrame(
        [
            {
                "temperature": temp_c,
                "humidity": humidity,
                "wind_speed": wind_speed,
                "rain": rain,
                "gender": gender,
                "hour": hour,
                "day_of_week": day_of_week,
                "season": season,
                "weather_condition": condition,
            }
        ]
    )


def predict_from_models(model_input_df):
    outfit = {}
    for lbl, model in MODELS.items():
        pred = model.predict(model_input_df)[0]
        pred_label = LABEL_ENCODERS[lbl].inverse_transform([pred])[0]
        outfit[lbl.replace("_label", "")] = pred_label
    return outfit


def generate_tips_from_outfit(outfit, gender, weather):
    tips = []
    temp = weather.get("temperature_c", weather.get("temp_c", None))
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

    # Bottom
    if "skirt" in bottom and gender != "female":
        tips.append(f"{bottom} may be chilly for {gender}.")
    elif "shorts" in bottom and temp is not None and temp < 20:
        tips.append("Shorts may be too cold.")
    else:
        tips.append(f"{bottom} is suitable.")

    # Footwear
    if "boots" in footwear and weather.get("rain", 0):
        tips.append("Wear waterproof boots to keep feet dry.")
    elif "sandals" in footwear or "flip" in footwear:
        tips.append("Sandals/flipflops are suitable for hot weather.")
    else:
        tips.append(f"{footwear} are comfortable for daily use.")

    # Accessories
    if "umbrella" in accessory or "raincoat" in accessory or weather.get("rain", 0):
        tips.append("Carry an umbrella or wear waterproof clothing.")
    if "scarf" in accessory or "gloves" in accessory or "hat" in accessory:
        tips.append("Consider adding accessories to stay warm.")
    return tips


# ---------- Endpoints ----------
@app.get("/outfit/{city}")
def get_outfit(
    city: str,
    gender: str = Query("male", enum=["male", "female", "baby"]),
    unit: str = Query("C", enum=["C", "F"]),
):
    """
    Current outfit recommendation (uses Celsius internally for model input).
    Returns temps in requested unit for display.
    """
    try:
        w = fetch_current_weather_for_model(city)
        # build model input (Celsius)
        model_df = construct_model_df_row(
            temp_c=w["temperature_c"],
            humidity=w["humidity"],
            wind_speed=w["wind_speed"],
            rain=w["rain"],
            gender=gender,
            hour=12,
            day_of_week=(
                datetime.utcfromtimestamp(w["timestamp"]).strftime("%a")
                if w.get("timestamp")
                else "Mon"
            ),
            season=w["season"],
            condition=w["weather_condition"],
        )
        outfit = predict_from_models(model_df)
        tips = generate_tips_from_outfit(outfit, gender, w)

        # prepare response temps in requested unit
        if unit.upper() == "F":
            temp = round(c_to_f(w["temperature_c"]), 1)
            feels = round(c_to_f(w["feels_like_c"]), 1)
        else:
            temp = round(w["temperature_c"], 1)
            feels = round(w["feels_like_c"], 1)

        response = {
            "city": city,
            "gender": gender,
            "temperature": temp,
            "feels_like": feels,
            "humidity": w["humidity"],
            "wind_speed": w["wind_speed"],
            "weather_condition": w["weather_condition"],
            "season": w["season"],
            "unit": unit.upper(),
            "outfit": {**outfit, "tips": tips},
        }
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/forecast/{city}")
def get_forecast(
    city: str,
    gender: str = Query("male", enum=["male", "female", "baby"]),
    unit: str = Query("C", enum=["C", "F"]),
    days: int = Query(3, ge=1, le=3),
):
    """
    Next `days` days forecast with outfit suggestions (excludes today).
    Model inputs are computed in Celsius (forecast uses metric), response temps converted to requested unit.
    """
    try:
        days_agg = fetch_forecast_days(city, days=days)
        forecasts = []
        for day in days_agg:
            # model input uses Celsius (temp_c)
            model_df = construct_model_df_row(
                temp_c=day["temp_c"],
                humidity=day["humidity"],
                wind_speed=day["wind_speed"],
                rain=day["rain"],
                gender=gender,
                hour=12,
                day_of_week=datetime.utcfromtimestamp(day["timestamp"]).strftime("%a"),
                season=day["season"],
                condition=day["condition"],
            )
            outfit = predict_from_models(model_df)
            tips = generate_tips_from_outfit(
                outfit, gender, {"temperature_c": day["temp_c"], "rain": day["rain"]}
            )

            # convert display temp
            if unit.upper() == "F":
                display_temp = round(c_to_f(day["temp_c"]), 1)
                display_feels = round(c_to_f(day["feels_like_c"]), 1)
            else:
                display_temp = round(day["temp_c"], 1)
                display_feels = round(day["feels_like_c"], 1)

            forecasts.append(
                {
                    "date": day["date"],
                    "day": datetime.strptime(day["date"], "%Y-%m-%d").strftime("%a"),
                    "temp": display_temp,
                    "feels_like": display_feels,
                    "humidity": round(day["humidity"], 1),
                    "wind_speed": round(day["wind_speed"], 1),
                    "condition": day["condition"],
                    "rain": bool(day["rain"]),
                    "unit": unit.upper(),
                    "outfit": {**outfit, "tips": tips},
                }
            )
        return {"city": city, "forecasts": forecasts}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
