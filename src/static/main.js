
document.addEventListener('DOMContentLoaded', function() {
    let mapOptions = {
        center:[32, -96],
        zoom:5,
        minZoom:3,
    }
    
    let map = new L.map('map' , mapOptions);

    let layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    map.addLayer(layer);

    let marker = null;
    map.on('click', (event)=> {
    
        if(marker !== null){
            map.removeLayer(marker);
        }
    
        marker = L.marker([event.latlng.lat , event.latlng.lng]).addTo(map);

        let latitude = event.latlng.lat;
        let longitude = ((event.latlng.lng + 180) % 360) - 180;
        document.getElementById('latitude').value = latitude;
        document.getElementById('longitude').value = longitude;
        
        var data = fetch("/getWeatherData?long="+longitude+"&lat="+latitude)
        .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            console.log("Working");
            return response.json();
          })
          .then(data => {
            console.log((data['power'] * 100).toFixed(2));
            var finalVal = document.getElementById('finalVal');
            finalVal.innerHTML = (data['power'] * 100).toFixed(2)+"%";
          })
          .catch(error => {
            console.error('Error:', error);
          });
    })
});
