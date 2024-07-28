
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
  let location = document.getElementById('location');

  let latitude;
  let longitude;

  function fetchWeatherData(longitude_, latitude_) {
    return fetch("/getWeatherData?long=" + longitude_ + "&lat=" + latitude_)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        console.log("Working");
        return response.json();
      }).then(response => {
        tempIn.value = response[0]['temperature_2m'];
        humidityIn.value = response[0]['relativehumidity_2m'];
        windSpeedIn.value = response[0]['windspeed_100m'];
        windDirIn.value = response[0]['winddirection_100m'];
        location.innerHTML = response[1][0] + ", " + response[1][1];
        return response[0];
      }).catch(error => {
        console.error('Error:', error);
      });
  }

  function getPower(response) {
    console.log(response);
    fetch("/findPower?temp=" + response['temperature_2m'] + "&hum=" + response['relativehumidity_2m'] + "&speed=" + response['windspeed_100m'] + "&dir=" + response['winddirection_100m'])
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
          finalVal.style.color = "red";
        } else if (val < 30) {
          console.log("orange")
          finalVal.style.color = "orange";
        } else {
          console.log("green")
          finalVal.style.color = "green";
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  tempIn.addEventListener('input', function () {
    result = {
      'temperature_2m': tempIn.value,
      'relativehumidity_2m': humidityIn.value,
      'windspeed_100m': windSpeedIn.value,
      'winddirection_100m': windDirIn.value
    }
    getPower(result);
  }, false);

  humidityIn.addEventListener('input', function () {
    result = {
      'temperature_2m': tempIn.value,
      'relativehumidity_2m': humidityIn.value,
      'windspeed_100m': windSpeedIn.value,
      'winddirection_100m': windDirIn.value
    }
    getPower(result);
  }, false);

  windSpeedIn.addEventListener('input', function () {
    result = {
      'temperature_2m': tempIn.value,
      'relativehumidity_2m': humidityIn.value,
      'windspeed_100m': windSpeedIn.value,
      'winddirection_100m': windDirIn.value
    }
    getPower(result);
  }, false);

  windDirIn.addEventListener('input', function () {
    result = {
      'temperature_2m': tempIn.value,
      'relativehumidity_2m': humidityIn.value,
      'windspeed_100m': windSpeedIn.value,
      'winddirection_100m': windDirIn.value
    }
    getPower(result);
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
    fetchWeatherData(longitude, latitude).then(results => {
      getPower(results);
    })

    fetch("/plot.png?long=" + longitude + "&lat=" + latitude)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        console.log("Working");
        return response.json();
      }).then(response => {
        console.log(response);
      }).catch(error => {
        console.error('Error:', error);
      });
  })


  let latInput = document.getElementById('latitude');
  let longInput = document.getElementById('longitude');

  latInput.addEventListener('input', function (event) {
    latitude = event.target.value;

    // REMOVING MARKER 
    if (marker !== null) {
      map.removeLayer(marker);
    }
    // SETTING DOWN MARKER
    marker = L.marker([latInput.value, longInput.value]).addTo(map);

    fetchWeatherData(longitude, latitude).then(results => {
      getPower(results);
    })
  });

  longInput.addEventListener('input', function (event) {
    longitude = event.target.value;

    // REMOVING MARKER 
    if (marker !== null) {
      map.removeLayer(marker);
    }
    // SETTING DOWN MARKER
    marker = L.marker([latInput.value, longInput.value]).addTo(map);

    fetchWeatherData(longitude, latitude).then(results => {
      getPower(results);
    })
  });


});
