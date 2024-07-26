document.addEventListener('DOMContentLoaded', function() {
    let mapOptions = {
        center:[32, -96],
        zoom:7
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
        document.getElementById('latitude').value = event.latlng.lat;
        document.getElementById('longitude').value = event.latlng.lng;
        
        
        fetch("/getWeatherData?long="+event.latlng.lng+"&lat="+event.latlng.lat)
        .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            console.log(data);
          })
          .catch(error => {
            console.error('Error:', error);
          });
    })
});