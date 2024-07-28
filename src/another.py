import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from meteostat import Point, Monthly, Daily
import io

# Define location (latitude, longitude)
location = Point(52.5200, 13.4050)  # Example: Berlin, Germany

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
plt.xticks(pd.date_range(start=start, end=end, freq='M').strftime('%Y-%m'), rotation=45)

# Wind Speed
plt.subplot(3, 1, 2)
sns.lineplot(data=df['Wind Speed (km/h)'], color='g')
plt.title('Monthly Average Wind Speed')
plt.xlabel('Time')
plt.ylabel('Wind Speed (km/h)')
plt.xticks(pd.date_range(start=start, end=end, freq='M').strftime('%Y-%m'), rotation=45)

plt.tight_layout()
plt.show()
plt.tight_layout()

# Save the plot to a BytesIO object
img = io.BytesIO()
plt.savefig(img, format='png')
img.seek(0)
plt.close()

return send_file(img, mimetype='image/png')