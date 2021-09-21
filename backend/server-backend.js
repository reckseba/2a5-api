const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./routes/api');
const path = require('path');
require('dotenv').config({path: './config/process.env'});

let credentials = {};

// new express server
const app = express();

// prepare database link
const dblink = "mongodb+srv://" + process.env.DBUSERNAME + ":" + process.env.DBPASSWORD + "@" + process.env.DBCLUSTER + "." + process.env.DBSERVER + ".mongodb.net/" + process.env.DBDATABASENAME + "?retryWrites=true&w=majority"

// connect to the database
mongoose.connect(dblink, { useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.log(err));

// since mongoose promise is depreciated, we override it with a node's promise
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

if(process.env.PROTOCOL == "https") {

  // Certificate
  if(["test", "local"].includes(process.env.ENVIRONMENT)) {
    credentials.key = fs.readFileSync(`./ssl/test.privkey.pem`, 'utf8');
    credentials.cert = fs.readFileSync(`./ssl/test.cert.pem`, 'utf8');
  }

  // if it's production then we want the ca chain cert to be included
	if(process.env.ENVIRONMENT == "prod") {
    credentials.key = fs.readFileSync(`./ssl/privkey.pem`, 'utf8');
    credentials.cert = fs.readFileSync(`./ssl/cert.pem`, 'utf8');
		credentials.ca = fs.readFileSync(`./ssl/chain.pem`, 'utf8');
	}

  // start the https server
  const httpsServer = https.createServer(credentials, app);

  // bind port we defined in config file
  httpsServer.listen(process.env.PORTBACKEND, () => {
    console.log(`HTTPS Prod-Server running on port ${process.env.PORTBACKEND}`);
  });

} else if(process.env.PROTOCOL == "http") {

  const httpServer = http.createServer(app);

  httpServer.listen(process.env.PORTBACKEND, () => {
    console.log(`HTTP Test-Server running on port ${process.env.PORTBACKEND}`);
  });

} else {
  console.log("Please define a protocol in your config file.");
}