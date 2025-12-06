import pandas as pd
import numpy as np
import random

# SEED FOR REPRODUCIBILITY
np.random.seed(42)
random.seed(42)

# SETTINGS
N = 30000

# Weather features
temperatures = np.random.randint(-10, 45, N)  # temperature range
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

# MASTER TEMPERATURE + GENDER + RAIN AND SHOW MAPPING
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
            "warm_gloves",
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
            "sweater",
            "hoodie",
            "medium_winter_jacket",
            "quilted_jacket",
            "warm_pants",
            "winter_boots",
            "warm_gloves",
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
            "hoodie",
            "winter_long_coat",
            "quilted_jacket",
            "warm_pants",
            "winter_boots",
            "warm_gloves",
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
        ],
    },
    {
        "temp_min": 6,
        "temp_max": 10,
        "gender": "baby",
        "categories": ["onesie", "sweater", "fleece_jacket", "booties"],
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
            "light_jacket",
            "jeans_or_chinos",
            "sweatpants",
            "sneakers",
        ],
    },
    {
        "temp_min": 11,
        "temp_max": 15,
        "gender": "baby",
        "categories": ["onesie", "sweater", "cotton_pants"],
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
        "categories": ["long_sleeve_shirt", "sweatshirt", "pant", "sneakers", "cap"],
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
            "sun_hat",
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
        "categories": ["tshirt", "shorts", "sneakers", "cap"],
    },
    {
        "temp_min": 26,
        "temp_max": 30,
        "gender": "female",
        "categories": ["tshirt", "dress", "skirt", "sneakers", "sandals", "sun_hat"],
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
        "categories": ["umbrella", "raincoat", "waterproof_jacket", "waterproof_boots"],
    },
    # SNOW overrides
    {
        "weather_condition": "Snow",
        "gender": "all",
        "categories": [
            "snow_jacket",
            "snow_pants",
            "snow_boots",
            "warm_hat",
            "gloves",
            "scarf",
        ],
    },
]


# FUNCTION TO PICK OUTFIT
def get_categories(temp, weather, gender):
    outfit = []

    # Temperature & gender rules
    for rule in TEMP_MAPPING:
        if "weather_condition" not in rule:
            if rule["temp_min"] <= temp <= rule["temp_max"]:
                if rule["gender"] == "adult" and gender in ["male", "female"]:
                    outfit.extend(rule["categories"])
                elif rule["gender"] == gender:
                    outfit.extend(rule["categories"])

    # Rain overrides
    for rule in TEMP_MAPPING:
        if "weather_condition" in rule and weather == "Rain":
            outfit.extend(rule["categories"])

    return list(set(outfit))  # remove duplicates


# Sub-labels compatible with ML
def select_top(categories):
    for c in categories:
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
    for c in categories:
        if any(x in c for x in ["pants", "jeans", "shorts", "skirt"]):
            return c
    return "pants"


def select_footwear(categories):
    for c in categories:
        if any(x in c for x in ["boots", "sandals", "shoes", "sneakers", "booties"]):
            return c
    return "sneakers"


def select_accessory(categories):
    for c in categories:
        if any(x in c for x in ["hat", "cap", "scarf", "umbrella", "goggles"]):
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

# ML labels
data["top_label"] = data["full_outfit_categories"].apply(select_top)
data["bottom_label"] = data["full_outfit_categories"].apply(select_bottom)
data["footwear_label"] = data["full_outfit_categories"].apply(select_footwear)
data["accessory_label"] = data["full_outfit_categories"].apply(select_accessory)

# SAVE CSV
data.to_csv("data/synthetic_30k.csv", index=False)
print("Dataset saved → data/synthetic_30k.csv   Shape:", data.shape)
