const router = require('express').Router();
const fs = require('fs');
const getVisitorView = require('./view');
const { compose, last, split } = require('../utilities');

// constants
const VISITOR_LOG_FILE = './visitorLog';

// Load log file
let visitors = JSON.parse(fs.readFileSync(VISITOR_LOG_FILE));

// IP Geo Logger middleware
router.get('/*', async (req, res, next) => {
  const ip = compose(
    last,
    split(':')
  )(req.headers['x-forwarded-for'] || req.socket.remoteAddress);

  if (!visitors[ip]) {
    // New Visitor! looking up location
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
  req.user = { ...req.user, ...visitors[ip] };

  next();
});

router.get('/visitor', (req, res) => {
  res.send(
    getVisitorView({
      town: req.user.cityStr,
      latLng: req.user.latLng,
    })
  );
});

router.get('/api/visitor', (req, res) => {
  res.json(visitors);
});

module.exports = router;
