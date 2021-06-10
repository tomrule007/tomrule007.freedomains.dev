const path = require('path');
const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.json({ limit: '5mb' }));
const session = require('express-session');
//TODO: setup real production ready session store (default is a leaky in memory store)
app.use(
  session({ secret: 'sneakyCookie', resave: false, saveUninitialized: false })
);

// *Must require statements must remain wrapped in arrow function to insure files get reloaded
app.use((req, res, next) => {
  require('./p1')(req, res, next);
});
app.use((req, res, next) => {
  require('./p2')(req, res, next);
});
app.use((req, res, next) => {
  require('./p3')(req, res, next);
});
app.use((req, res, next) => {
  require('./p4')(req, res, next);
});
app.use('/p5', (req, res, next) => {
  require('./p5')(req, res, next);
});
app.use('/p6', (req, res, next) => {
  require('./p6')(req, res, next);
});
app.use('/p7', (req, res, next) => {
  require('./p7')(req, res, next);
});
app.use('/p8', (req, res, next) => {
  require('./p8')(req, res, next);
});
app.use('/p9', (req, res, next) => {
  require('./p9')(req, res, next);
});

app.get('/js6/p3/*', (req, res, next) => {
  res.sendFile(path.join(__dirname, '../public/js6/p3/index.html'));
});

app.get('/js6/p4/*', (req, res, next) => {
  res.sendFile(path.join(__dirname, '../public/js6/p4/index.html'));
});

app.get('/react/*', (req, res, next) => {
  res.sendFile(path.join(__dirname, '../public/react/index.html'));
});
module.exports = app;
