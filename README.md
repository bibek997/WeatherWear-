# WeatherWear – Weather-Based Outfit Recommender

A full-stack mobile app that suggests what to wear based on live weather data.  
Built for **Expo SDK 54** (React-Native) and **FastAPI** (Python)

---

## 🚀 Features

- **Live weather** – OpenWeatherMap API
- **ML recommendations** – XGBoost (94 % accuracy)
- **Gender-aware** – male / female / baby wardrobes
- **GPS + manual city** – Expo Location
- **Emoji visuals** – garment → emoji map
- **3-day forecast** – swipeable cards
- **Dark-mode ready** – system-aware theme
- **Offline cache** – last 3 days stored locally

---

## 📦 Tech Stack

| Layer      | Tech                                   |
| ---------- | -------------------------------------- |
| Mobile     | React-Native 0.81 + Expo SDK 54        |
| Navigation | React Navigation (native-stack)        |
| ML Backend | Python 3.11 + FastAPI + XGBoost        |
| Weather    | OpenWeatherMap REST API                |
| Storage    | AsyncStorage (mobile) / pickle (model) |
| Auth (opt) | Firebase Auth (future work)            |

## ⚙️ Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0
```

### 2. Frontend

```bash
cd frontend
npm install
npx expo start
```
