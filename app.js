const { getView } = require('./viewTemplate');

const express = require('express');
const app = express();
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('I AM LIVE');
});

app.get('/visitor', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(ip);

  res.send(getView(ip));
});

app.get('/api/visitor', (req, res) => {
  const visitors = { iphash: { town: 'New york', cords: 'cords' } };
  console.log(req);
  res.json(visitors);
});

const port = process.env.PORT || 8123;
app.listen(port, () => {
  console.log('Server is running on port: ', port);
});
