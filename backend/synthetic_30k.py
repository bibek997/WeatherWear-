import pandas as pd
import numpy as np
import random

# SEED FOR REPRODUCIBILITY
np.random.seed(42)
random.seed(42)

# SETTINGS
N = 30000

# WEATHER FEATURES
temperatures = np.random.randint(-10, 45, N)
humidity = np.random.randint(20, 100, N)
wind_speed = np.random.uniform(0, 15, N)

weather_condition = np.random.choice(
    ["Clear", "Clouds", "Rain", "Snow", "Thunderstorm"],
    N,
    p=[0.45, 0.30, 0.15, 0.05, 0.05],
)

rain = np.array([1 if w in ["Rain", "Thunderstorm"] else 0 for w in weather_condition])

gender = np.random.choice(["male", "female", "baby"], N)
hour = np.random.randint(6, 22, N)
day_of_week = np.random.choice(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], N)
season = np.random.choice(["Spring", "Summer", "Autumn", "Winter"], N)

# TEMP MAPPING (UNCHANGED)
TEMP_MAPPING = [
    # EXTREME COLD (-10 to 0°C)
    {
        "temp_min": -10,
        "temp_max": 0,
        "gender": "adult",
        "categories": [
            "insulated_jacket",
            "insulated_parka",
            "puffer_jacket",
            "quilted_jacket",
            "down_jacket",
            "warm_pants",
            "winter_boots",
            "insulated_gloves",
            "thermal_hat",
            "scarf",
            "gloves",
        ],
    },
    {
        "temp_min": -10,
        "temp_max": 0,
        "gender": "baby",
        "categories": [
            "winter_jacket",
            "insulated_snowsuit",
            "booties",
            "mittens",
            "warm_hat",
            "warm_gloves",
        ],
    },
    # VERY COLD (1-5°C)
    {
        "temp_min": 1,
        "temp_max": 5,
        "gender": "male",
        "categories": [
            "fleece_jacket",
            "puffer_jacket",
            "medium_winter_jacket",
            "quilted_jacket",
            "warm_pants",
            "winter_boots",
            "gloves",
            "scarf",
        ],
    },
    {
        "temp_min": 1,
        "temp_max": 5,
        "gender": "female",
        "categories": [
            "fleece_jacket",
            "puffer_jacket",
            "wool_sweater",
            "winter_long_coat",
            "quilted_jacket",
            "warm_pants",
            "winter_boots",
            "gloves",
            "scarf",
        ],
    },
    {
        "temp_min": 1,
        "temp_max": 5,
        "gender": "baby",
        "categories": ["fleece_jacket", "booties", "soft_cap"],
    },
    # COLD (6-10°C)
    {
        "temp_min": 6,
        "temp_max": 10,
        "gender": "male",
        "categories": [
            "fleece_jacket",
            "puffer_jacket",
            "sweater",
            "hoodie",
            "Jeans",
            "warm_pants",
            "sweatpants",
            "boots",
            "gloves",
            "scarf",
        ],
    },
    {
        "temp_min": 6,
        "temp_max": 10,
        "gender": "female",
        "categories": [
            "puffer_jacket",
            "fleece_jacket",
            "sweater",
            "hoodie",
            "Jeans",
            "warm_pants",
            "sweatpants",
            "ankle_boots",
            "gloves",
            "scarf",
        ],
    },
    {
        "temp_min": 6,
        "temp_max": 10,
        "gender": "baby",
        "categories": [
            "onesie",
            "sweater",
            "fleece_jacket",
            "booties",
        ],
    },
    # MILD (11-15°C)
    {
        "temp_min": 11,
        "temp_max": 15,
        "gender": "male",
        "categories": [
            "light_puffer_jacket",
            "hoodie",
            "cardigan",
            "windbreaker",
            "light_jacket",
            "jeans_or_chinos",
            "sweatpants",
            "boots",
            "sneakers",
            "scarf",
        ],
    },
    {
        "temp_min": 11,
        "temp_max": 15,
        "gender": "female",
        "categories": [
            "light_puffer_jacket",
            "hoodie",
            "windbreaker",
            "cardigan",
            "jeans_or_chinos",
            "sweatpants",
            "sneakers",
            "scarf",
        ],
    },
    {
        "temp_min": 11,
        "temp_max": 15,
        "gender": "baby",
        "categories": [
            "onesie",
            "sweater",
            "cotton_pants",
        ],
    },
    # WARM (16-20°C)
    {
        "temp_min": 16,
        "temp_max": 20,
        "gender": "male",
        "categories": [
            "windbreaker",
            "light_jacket",
            "light_cardigan",
            "pants",
            "sneakers",
        ],
    },
    {
        "temp_min": 16,
        "temp_max": 20,
        "gender": "female",
        "categories": [
            "windbreaker",
            "light_cardigan",
            "trench_coat",
            "leggings",
            "sneakers",
        ],
    },
    {
        "temp_min": 16,
        "temp_max": 20,
        "gender": "baby",
        "categories": ["light_onesie", "cotton_pants"],
    },
    # WARM (21-26°C)
    {
        "temp_min": 21,
        "temp_max": 26,
        "gender": "male",
        "categories": [
            "long_sleeve_shirt",
            "sweatshirt",
            "pant",
            "sneakers",
            "cap",
        ],
    },
    {
        "temp_min": 21,
        "temp_max": 26,
        "gender": "female",
        "categories": [
            "sundresses",
            "long_sleeve_tshirt",
            "knee_length_skirts",
            "sneakers",
            "sandals",
            "hat",
        ],
    },
    {
        "temp_min": 26,
        "temp_max": 30,
        "gender": "baby",
        "categories": ["short_sleeve_onesie", "sun_hat"],
    },
    # HOT (26-30°C)
    {
        "temp_min": 26,
        "temp_max": 30,
        "gender": "male",
        "categories": [
            "tshirt",
            "shorts",
            "sneakers",
            "cap",
        ],
    },
    {
        "temp_min": 26,
        "temp_max": 30,
        "gender": "female",
        "categories": [
            "tshirt",
            "dress",
            "skirt",
            "sneakers",
            "sandals",
            "sun_hat",
        ],
    },
    {
        "temp_min": 21,
        "temp_max": 30,
        "gender": "baby",
        "categories": ["short_sleeve_onesie", "sun_hat"],
    },
    # VERY HOT (31-45°C)
    {
        "temp_min": 31,
        "temp_max": 45,
        "gender": "male",
        "categories": [
            "tank_top",
            "tshirt",
            "shorts",
            "sandals",
            "sun_hat",
            "cap",
            "sunglasses",
        ],
    },
    {
        "temp_min": 31,
        "temp_max": 45,
        "gender": "female",
        "categories": ["baby_tee", "miniskirt", "sandals", "sun_hat", "sunglasses"],
    },
    {
        "temp_min": 31,
        "temp_max": 45,
        "gender": "baby",
        "categories": ["single_thin_layer", "sun_hat"],
    },
    # RAIN overrides
    {
        "weather_condition": "Rain",
        "gender": "all",
        "categories": [
            "raincoat",
            "waterproof_jacket",
            "overtrousers",
            "gumboot",
            "umbrella",
        ],
    },
    # SNOW overrides
    {
        "weather_condition": "Snow",
        "gender": "all",
        "categories": [
            "insulated_parka",
            "warm_pants",
            "winter_boots",
            "sherpa_topi",
            "gloves",
            "scarf",
        ],
    },
]


# FUNCTION TO PICK OUTFIT
def get_categories(temp, weather, gender):
    # Picks outfit categories based on temperature, gender, and weather overrides. Returns a list of categories.
    outfit = []

    weather_lower = weather.lower() if isinstance(weather, str) else ""

    for rule in TEMP_MAPPING:
        # Temperature & gender-based rules
        if "weather_condition" not in rule:
            if rule["temp_min"] <= temp <= rule["temp_max"]:
                if rule["gender"] == "adult" and gender in ["male", "female"]:
                    outfit.extend(rule["categories"])
                elif rule["gender"] == gender:
                    outfit.extend(rule["categories"])
        else:
            if weather_lower == rule["weather_condition"].lower():
                outfit.extend(rule["categories"])

    return list(set(outfit))


# LABEL SELECTORS
def select_top(categories):
    categories_lower = [c.lower() for c in categories]
    for c in categories_lower:
        if any(
            x in c
            for x in [
                "shirt",
                "tshirt",
                "hoodie",
                "sweater",
                "jacket",
                "coat",
                "blouse",
                "turtleneck",
                "tank",
            ]
        ):
            return c
    return "tshirt"


def select_bottom(categories):
    categories_lower = [c.lower() for c in categories]
    for c in categories_lower:
        if any(x in c for x in ["pants", "jeans", "shorts", "skirt"]):
            return c
    return "pants"


def select_footwear(categories, weather=None):
    categories_lower = [c.lower() for c in categories]
    is_rain = False
    is_snow = False

    if weather:
        weather_lower = weather.lower() if isinstance(weather, str) else ""
        is_rain = weather_lower == "rain"
        is_snow = weather_lower == "snow"

    # PRIORITIZE RAIN BOOTS IF RAINING
    if is_rain:
        for c in categories_lower:
            if "gumboot" in c:
                return c
    # PRIORITIZE WINTER BOOTS IF SNOWING
    if is_snow:
        for c in categories_lower:
            if "winter_boots" in c:
                return c

    # Otherwise pick normal footwear
    for c in categories_lower:
        if any(
            x in c
            for x in ["boots", "sandals", "shoes", "sneakers", "booties", "gumboot"]
        ):
            return c

    return "sneakers"


def select_accessory(categories, weather=None):
    categories_lower = [c.lower() for c in categories]

    condition = weather.lower() if isinstance(weather, str) else ""

    # SNOW PRIORITY
    if condition == "snow":
        for c in categories_lower:
            if "sherpa_topi" in c:
                return c
        for c in categories_lower:
            if "gloves" in c or "scarf" in c:
                return c

    # RAIN PRIORITY
    if condition == "rain":
        for c in categories_lower:
            if "umbrella" in c:
                return c

    # REGULAR SELECTION
    for c in categories_lower:
        if any(
            x in c
            for x in [
                "hat",
                "cap",
                "scarf",
                "umbrella",
                "sunglasses",
                "gloves",
                "sherpa_topi",
            ]
        ):
            return c

    return "none"


# BUILD DATAFRAME
data = pd.DataFrame(
    {
        "temperature": temperatures,
        "humidity": humidity,
        "wind_speed": wind_speed,
        "weather_condition": weather_condition,
        "rain": rain,
        "gender": gender,
        "hour": hour,
        "day_of_week": day_of_week,
        "season": season,
    }
)

# Full outfit categories
data["full_outfit_categories"] = [
    get_categories(t, w, g)
    for t, w, g in zip(data.temperature, data.weather_condition, data.gender)
]

# ML labels with weather-awareness for accessories/footwear
data["top_label"] = data["full_outfit_categories"].apply(select_top)
data["bottom_label"] = data["full_outfit_categories"].apply(select_bottom)
data["footwear_label"] = [
    select_footwear(cat, weather=w)
    for cat, w in zip(data.full_outfit_categories, data.weather_condition)
]
data["accessory_label"] = [
    select_accessory(cat, weather=w)
    for cat, w in zip(data.full_outfit_categories, data.weather_condition)
]

# SAVE CSV
data.to_csv("data/synthetic_30k.csv", index=False)
print("Dataset saved → data/synthetic_30k.csv   Shape:", data.shape)
