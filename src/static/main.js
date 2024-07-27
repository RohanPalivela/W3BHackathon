
document.addEventListener('DOMContentLoaded', function() {
    let mapOptions = {
        center:[32, -96],
        zoom:5,
        minZoom:2,
        noWrap: true,
        bounds: [
          [-90, -180],
          [90, 180]
        ]
    }
    
    let map = new L.map('map' , mapOptions);

    let layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    map.addLayer(layer);

    let btn = document.getElementsByClassName('button-green')[0];

    let tempIn = document.getElementById('temperature');
    let humidityIn = document.getElementById('humidity');
    let windSpeedIn = document.getElementById('wind-speed');
    let windDirIn = document.getElementById('wind-direction');
    
    btn.addEventListener("click", function() {

      fetch("/findPower?temp="+tempIn.value+"&hum="+humidityIn.value+"&speed="+windSpeedIn.value+"&dir="+windDirIn.value)
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
          finalVal.innerHTML = (result['power'] * 100).toFixed(2)+"%";
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }, false);

    let marker = null;
    map.on('click', (event)=> {
      
      // REMOVING MARKER 
      if(marker !== null){
          map.removeLayer(marker);
      }
      
      // SETTING DOWN MARKER
      marker = L.marker([event.latlng.lat , event.latlng.lng]).addTo(map);

      // SET LATITUDE AND LONGITUDE INPUTS
      let latitude = event.latlng.lat;
      let longitude = ((event.latlng.lng + 180) % 360) - 180;
      document.getElementById('latitude').value = latitude;
      document.getElementById('longitude').value = longitude;
      
      // UPDATE LIVE DATA 4 INPUTS
      var data = fetch("/getWeatherData?long="+longitude+"&lat="+latitude)
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
    })
});
