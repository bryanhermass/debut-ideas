const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.json());
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/send', async (req, res) => {
  const { name, surname } = req.body;
  try {
    await axios.post('http://producer:4000/event', { name, surname });
    console.info(`Event sent to producer: ${name} ${surname}`);
    res.send({ status: 'ok' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 'error', message: 'Could not send event' });
  }
});

app.listen(3000, () => {
  console.log('Web server is listening on port 3000');
});