const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.json({ limit: '5mb' }));

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
module.exports = app;
