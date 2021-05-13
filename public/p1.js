function initMap() {
  // The location of Uluru
  const uluru = { lat: -25.344, lng: 131.036 };
  // The map, centered at Uluru
  console.log('hello');
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: uluru,
  });
}
