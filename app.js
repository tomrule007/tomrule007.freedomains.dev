const { getView } = require('./viewTemplate');
const fs = require('fs');
const fetch = require('node-fetch');
const express = require('express');
const app = express();
app.use(express.static('public'));

// constants
const VISITOR_LOG_FILE = './visitorLog';

// Utility functions
const compose =
  (...fns) =>
  (x) =>
    fns.reduceRight((x, y) => y(x), x);

const last = (a) => a[a.length - 1];
const split = (separator) => (string) => string.split(separator);

// Load log file
let visitors = JSON.parse(fs.readFileSync(VISITOR_LOG_FILE));

// IP Geo Logger middleware
app.get('/*', async (req, res, next) => {
  const ipString =
    process.env.NODE_ENV === 'development'
      ? '::ffff:71.93.230.0'
      : req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const ip = compose(last, split(':'))(ipString);

  console.log(process.env.NODE_ENV, ipString, ip);

  if (!visitors[ip]) {
    console.log('New Visitor! looking up location');

    try {
      const response = await fetch(
        `https://js5.c0d3.com/location/api/ip/${ip}`
      );
      const { ll, cityStr } = await response.json();

      visitors[ip] = { latLng: { lat: ll[0], lng: ll[1] }, cityStr };
    } catch (error) {
      console.log('fetch geo error', error);
    }

    // save to log
    fs.writeFile(VISITOR_LOG_FILE, JSON.stringify(visitors), (err) => {
      if (err) return console.log('Write Error', err);
    });
  }

  // set user info
  req.user = visitors[ip];

  next();
});

app.get('/visitor', (req, res) => {
  console.log('the user', req.user);

  res.send(getView(req.user.cityStr, req.user.latLng));
});

app.get('/api/visitor', (req, res) => {
  res.json(visitors);
});

const port = process.env.PORT || 8123;
app.listen(port, () => {
  console.log('Server is running on port: ', port);
});
