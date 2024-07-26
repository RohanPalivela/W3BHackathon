from flask import Flask, redirect, url_for,render_template, request, jsonify
from dotenv import load_dotenv
import os
import requests

load_dotenv()

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
    print(weather_data)
    return jsonify(
        confirmation="WORKED",
        m_long=long,
        m_lat=lat 
    )

# Function to get weather data based on latitude and longitude
def get_weather_data(lat, lon):
    # OpenWeatherMap API endpoint for current weather data using coordinates
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={os.getenv('WEATHER_API_KEY')}&units=metric"

    # Make a GET request to fetch the raw weather data
    response = requests.get(url)
    data = response.json()

    if response.status_code == 200:
        # Extract required data
        weather_data = {
            "ApparentTemperature": data['main']['feels_like'], # Feels like temperature
            "AirTemperature": data['main']['temp'],            # Actual air temperature
            "DewPointTemperature": data['main'].get('dew_point', 'N/A'), # Dew Point Temperature (if available)
            "RelativeHumidity": data['main']['humidity'],      # Relative Humidity
            "WindSpeed": data['wind']['speed'],                # Wind Speed
            "WindDirection": data['wind']['deg']               # Wind Direction
        }
    else:
        weather_data = {"Error": data.get("message", "Unable to fetch data")}

    return weather_data

if __name__ == '__main__':
    app.run(debug=True)
