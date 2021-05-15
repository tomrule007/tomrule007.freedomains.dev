module.exports.getView = (town, latLng) => `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>IP Geolocation</title>
      <style type="text/css">
        ul.no_bullet {
          list-style-type: none;
          padding: 0;
          margin: 0;
        }
        li.grn-pushpin {
          background: url('./grn-pushpin.png') no-repeat left top;
          background-size: 20px;
          height: 20px;
          padding-left: 20px;
          padding-top: 3px;
        }
        h1 {
          text-align: center;
        }
        #map {
          height: 400px;
          width: 100%;
        }
      </style>
    </head>
    <body>
      <h1>You Are visiting from</h1>
      <img src="./red-pushpin.png" />
      <h2>${town}</h2>
      <div id="map"></div>
      <h1>The cities our visitors come from</h1>
      <ul class="no_bullet" id="visitorList"></ul>
      <script>
        const yourLocation = {lat:${latLng.lat}, lng:${latLng.lng}};
      </script>
      <script src="p1.js"></script>
      <script
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB29pGpCzE_JGIEMLu1SGIqwoIbc0sHFHo&callback=initMap"
        async
      ></script>
    </body>
  </html>`;
