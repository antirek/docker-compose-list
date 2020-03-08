const express = require('express');
//const path = require('path');
const fs = require('fs');
const config = require('config');
const port = 3000


const app = express();

app.set('views', './views')
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('index');
});


app.get('/services', (req, res) => {
  const data = fs.readFileSync(config.outputFile);
  const q = [];
  const services = JSON.parse(data);
  console.log('services count', services.length);
  for (let i = 0; i < services.length; i++) {
    let s = services[i];
    q.push([s.host, s.app, s.name]);
  }
  res.send({data: q});
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});