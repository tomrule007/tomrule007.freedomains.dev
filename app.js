const express = require('express');
const app = express();
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.send('hello');
});

app.listen(process.env.PORT || 8123);
