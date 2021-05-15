function initMap() {
  // global yourLocation must be set!

  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: yourLocation,
  });

  // addMarker(map, yourLocation, 1, 'red');
}

var iconBase = './';
var icons = {
  red: {
    icon: iconBase + 'red-pushpin.png',
  },
  green: {
    icon: iconBase + 'grn-pushpin.png',
  },
};

// get visitor list
fetch('/api/visitor')
  .then((response) => response.json())
  .then(renderVisitors);

const $visitorList = document.querySelector('#visitorList');

function createVisitorListNode(city) {
  const li = document.createElement('li');
  li.classList.add('grn-pushpin');
  li.innerHTML = `<li>${city.cityStr} - ${city.count}</li>`;

  return li;
}

function renderVisitors(visitors) {
  const cityInfo = Object.values(
    Object.values(visitors).reduce((acc, { latLng, cityStr }) => {
      if (!acc[cityStr]) {
        //add city

        acc[cityStr] = { latLng, cityStr, count: 1 };
      } else {
        // inc count
        acc[cityStr].count += 1;
      }

      return acc;
    }, {})
  ).sort((a, b) => a.count - b.count);

  cityInfo.forEach((city) => {
    console.log();
    $visitorList.append(createVisitorListNode(city));
    addMarker(map, city.latLng, city.count, 'green');
  });
}

function addMarker(map, latLng, hits = 1, icon) {
  var marker = new google.maps.Marker({
    position: latLng,
    ...icons[icon],
    map: map,
    title: `${hits} hits`,
  });
}
