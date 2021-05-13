module.export = (town) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IP Geolocation</title>
    <style type="text/css">
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
    <h1>You Are visiting from: ${town}</h1>
    <div id="map"></div>
    
    <script src="p1.js"></script>
    <script
      src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB29pGpCzE_JGIEMLu1SGIqwoIbc0sHFHo&callback=initMap"
      async
    ></script>
  </body>
</html>`;
