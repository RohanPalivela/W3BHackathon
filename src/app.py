from flask import Flask, redirect, url_for,render_template, request, jsonify
from dotenv import load_dotenv
import os
import requests
import joblib
import pandas as pd

load_dotenv()

# Load the pre-trained model from a .joblib file
model = joblib.load('model.joblib')

WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')

app=Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/getWeatherData')
def queryWeather():
    long = request.args.get('long') 
    lat = request.args.get('lat') 
    # Get weather data
    weather_data = get_weather_data(lat, long)
    return jsonify(
        power=predict_power(weather_data)
    )

# Function to get weather data based on latitude and longitude
def get_weather_data(lat, lon):
    # OpenWeatherMap API endpoint for current weather data using coordinates
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={WEATHER_API_KEY}&units=metric"

    # Make a GET request to fetch the raw weather data
    response = requests.get(url)
    data = response.json()

    if response.status_code == 200:
        # Extract required data
        weather_data = {
            "temperature_2m": data['main']['temp'],            # Actual air temperature
            "relativehumidity_2m": data['main']['humidity'],      # Relative Humidity
            "windspeed_10m": data['wind']['speed'],                # Wind Speed
            "winddirection_10m": data['wind']['deg']               # Wind Direction
        }
    else:
        weather_data = {"Error": data.get("message", "Unable to fetch data")}

    return weather_data

# Function to get weather data based on temperature, humidity, wind speed, and wind direction
def get_weather_data_inputs(temperature, humidity, windspeed, winddirection):
    # OpenWeatherMap API endpoint for current weather data using coordinates
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={WEATHER_API_KEY}&units=metric"

    # Make a GET request to fetch the raw weather data
    response = requests.get(url)
    data = response.json()
    print(data)
    if response.status_code == 200:
        # Extract required data
        weather_data = {
            "temperature_2m": c_to_f(temperature),            # Actual air temperature
            "relativehumidity_2m": humidity,      # Relative Humidity
            "windspeed_10m": windspeed,                # Wind Speed
            "winddirection_10m": winddirection              # Wind Direction
        }
    else:
        weather_data = {"Error": data.get("message", "Unable to fetch data")}

    return weather_data

def c_to_f(c):
    return (((float) (c)) * (9/5) + 32)

def predict_power(weather_data):
    global model
    # Convert the weather data into a DataFrame
    data_df = pd.DataFrame([weather_data])
    
    # Predict the power generation
    prediction = model.predict(data_df)
    return prediction[0]

if __name__ == '__main__':
    app.run(debug=True)
