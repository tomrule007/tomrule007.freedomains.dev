const $visitorList = document.querySelector('#visitorList');

// Called by google maps api script (listed in callback query param)
function initMap() {
  // global yourLocation must be set!
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: yourLocation,
  });

  // get visitor list
  fetch('/api/visitor')
    .then((response) => response.json())
    .then((visitors) => {
      groupByCity(visitors).forEach((city) => {
        //Create and append visitor list node
        const li = document.createElement('li');
        li.textContent = `${city.cityStr} - ${city.count}`;
        $visitorList.append(li);

        //Create map markers
        new google.maps.Marker({
          position: city.latLng,
          map,
          title: `${city.count} hits`,
        });
      });
    });
}

function groupByCity(visitors) {
  return Object.values(
    Object.values(visitors).reduce((cities, visitor) => {
      const { cityStr } = visitor;
      // initialize city if it doesn't exist yet
      if (!cities[cityStr]) cities[cityStr] = { ...visitor, count: 0 };
      // inc count
      cities[cityStr].count += 1;

      return cities;
    }, {})
  ).sort((a, b) => b.count - a.count);
}
