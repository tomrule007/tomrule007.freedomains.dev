const { getView } = require('./viewTemplate');

const express = require('express');
const app = express();
app.use(express.static('public'));

app.get('/visitor', (req, res) => {
  console.log(req.socket.remoteAddress);

  res.send(getView(req.socket.remoteAddress));
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
