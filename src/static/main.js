
document.addEventListener('DOMContentLoaded', function () {
  let mapOptions = {
    center: [32, -96],
    zoom: 5,
    minZoom: 2,
    noWrap: true,
    bounds: [
      [-90, -180],
      [90, 180]
    ]
  }

  let map = new L.map('map', mapOptions);

  let layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  map.addLayer(layer);

  let btn = document.getElementsByClassName('button-green')[0];

  let tempIn = document.getElementById('temperature');
  let humidityIn = document.getElementById('humidity');
  let windSpeedIn = document.getElementById('wind-speed');
  let windDirIn = document.getElementById('wind-direction');

  let latitude;
  let longitude;

  function fetchWeatherData(longitude_, latitude_) {
    fetch("/getWeatherData?long=" + longitude_ + "&lat=" + latitude_)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        console.log("Working");
        return response.json();
      }).then(response => {
        tempIn.value = response['temperature_2m'];
        humidityIn.value = response['relativehumidity_2m'];
        windSpeedIn.value = response['windspeed_100m'];
        windDirIn.value = response['winddirection_100m'];
      }).catch(error => {
        console.error('Error:', error);
      });
  }

  btn.addEventListener("click", function () {
    fetch("/findPower?temp=" + tempIn.value + "&hum=" + humidityIn.value + "&speed=" + windSpeedIn.value + "&dir=" + windDirIn.value)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        console.log("Working");
        return response.json();
      })
      .then(result => {
        console.log(result['power']);
        let finalVal = document.getElementById('finalVal');
        let val = parseFloat((result['power'] * 100).toFixed(2));
        finalVal.innerHTML = val + "%";
        if (val < 15) {
          console.log("red")
          finalVal.style.color = red;
        } else if (val < 30) {
          console.log("yellow")
          finalVal.style.color = yellow;
        } else {
          console.log("green")
          finalVal.style.color = green;
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, false);

  let marker = null;
  map.on('click', (event) => {

    // REMOVING MARKER 
    if (marker !== null) {
      map.removeLayer(marker);
    }

    // SETTING DOWN MARKER
    marker = L.marker([event.latlng.lat, event.latlng.lng]).addTo(map);

    // SET LATITUDE AND LONGITUDE INPUTS
    latitude = event.latlng.lat;
    longitude = (event.latlng.lng / Math.abs(event.latlng.lng)) * (((Math.abs(event.latlng.lng) + 180) % 360) - 180);
    document.getElementById('latitude').value = latitude;
    document.getElementById('longitude').value = longitude;

    // UPDATE LIVE DATA 4 INPUTS
    fetchWeatherData(longitude, latitude)
  })


  let latInput = document.getElementById('latitude');
  let longInput = document.getElementById('longitude');

  latInput.addEventListener('input', function (event) {
    latitude = event.target.value;
    fetchWeatherData(longitude, latitude);
  });

  longInput.addEventListener('input', function (event) {
    longitude = event.target.value;
    fetchWeatherData(longitude, latitude);
  });
});
