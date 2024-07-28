from flask import Flask, redirect, url_for,render_template, request, jsonify, send_file
from dotenv import load_dotenv
import os
import requests
import joblib
import pandas as pd

import matplotlib.pyplot as plt
import seaborn as sns
from meteostat import Point, Monthly

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
    return weather_data

# Function to get weather data based on latitude and longitude
def get_weather_data(lat, lon):
    # OpenWeatherMap API endpoint for current weather data using coordinates
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={WEATHER_API_KEY}&units=metric"

    # Make a GET request to fetch the raw weather data
    response = requests.get(url)
    data = response.json()

    # print(data)

    if response.status_code == 200:
        # Extract required data
        weather_data = {
            "temperature_2m": c_to_f(data['main']['temp']),            # Actual air temperature
            "relativehumidity_2m": data['main']['humidity'],      # Relative Humidity
            "windspeed_100m": data['wind']['speed'],                # Wind Speed
            "winddirection_100m": data['wind']['deg']               # Wind Direction
        }

        location_data = [
            data['name'],
            data['sys']['country']
        ]
    else:
        weather_data = {"Error": data.get("message", "Unable to fetch data")}
    return [weather_data, location_data]

# Function to get weather data based on temperature, humidity, wind speed, and wind direction
@app.route('/findPower')
def get_power():
    # print(request.args.get('temp'), request.args.get('hum'), request.args.get('speed'), request.args.get('dir') )
    weather_data = {
        "temperature_2m": c_to_f(request.args.get('temp')),            # Actual air temperature
        "relativehumidity_2m": request.args.get('hum'),      # Relative Humidity
        "windspeed_100m": request.args.get('speed'),                # Wind Speed
        "winddirection_100m": request.args.get('dir')              # Wind Direction
    }
    numb = predict_power(weather_data)
    # print(numb)
    return jsonify(
        power=numb
    )

def c_to_f(c):
    c = float(c)
    return round((c * (9/5) + 32),2)

def predict_power(weather_data):
    global model
    # Convert the weather data into a DataFrame
    data_df = pd.DataFrame([weather_data])
    
    # Predict the power generation
    prediction = model.predict(data_df)
    return prediction[0]

@app.route('/plot.png')
def plot_png():
    # Define location (latitude, longitude)
    print(request.args.get('lat'), request.args.get('long'))
    location = Point(float(request.args.get('lat')), float(request.args.get('long')))  if request.args.get('lat') and request.args.get('long') else Point(32.7767, -96.7970)

    # Define time period (start and end)
    start = pd.Timestamp('2023-01-01')
    end = pd.Timestamp('2023-12-31')

    # Fetch monthly historical weather data
    data = Monthly(location, start, end)
    data = data.fetch()

    # Extract relevant columns and convert units if necessary
    temperature = data['tavg']
    wind_speed = data['wspd']

    # Create a DataFrame for easy plotting
    df = pd.DataFrame({
        'Temperature (°C)': temperature,
        'Wind Speed (km/h)': wind_speed,
    }, index=data.index)

    # Plot the data
    plt.figure(figsize=(14, 10))
    sns.set(style="whitegrid")

    # Temperature
    plt.subplot(3, 1, 1)
    sns.lineplot(data=df['Temperature (°C)'], color='r')
    plt.title('Monthly Average Temperature')
    plt.xlabel('Time')
    plt.ylabel('Temperature (°C)')
    plt.xticks(pd.date_range(start=start, end=end, freq='M'), rotation=45)

    # Wind Speed
    plt.subplot(3, 1, 2)
    sns.lineplot(data=df['Wind Speed (km/h)'], color='g')
    plt.title('Monthly Average Wind Speed')
    plt.xlabel('Time')
    plt.ylabel('Wind Speed (km/h)')
    plt.xticks(pd.date_range(start=start, end=end, freq='M'), rotation=45)

    plt.tight_layout()

    # Save the plot to a BytesIO object
    # img = io.BytesIO()
    img = plt.savefig('static/images/plt.png')
    return jsonify(confirmed= True)


if __name__ == '__main__':
    app.run(debug=True)