const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./routes/api');
const path = require('path');
require('dotenv').config({path: 'process.env'});

const app = express();

const env = process.env.ENVIRONMENT;
const portbackend = process.env.PORTBACKEND;

//connect to the database
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.log(err));

//since mongoose promise is depreciated, we overide it with node's promise
mongoose.Promise = global.Promise;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());

app.use('/', routes);

app.use((err, req, res, next) => {
  console.log(err);
  next();
});

if(env == "prod") {

  // Certificate
  const privateKey = fs.readFileSync(`ssl/privkey.pem`, 'utf8');
  const certificate = fs.readFileSync(`ssl/cert.pem`, 'utf8');
  const ca = fs.readFileSync(`ssl/chain.pem`, 'utf8');

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
  };

  const httpsServer = https.createServer(credentials, app);

  httpsServer.listen(portbackend, () => {
    console.log(`HTTPS Prod-Server running on port ${portbackend}`);
  });

} else if(env == "test") {

  const httpServer = http.createServer(app);

  httpServer.listen(portbackend, () => {
    console.log(`HTTP Test-Server running on port ${portbackend}`);
  });

} else {
  console.log("Please define an environment in process.env!");
}