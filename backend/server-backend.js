const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./routes/api');
require('dotenv').config({path: './config/process.env'});

// new express server
const app = express();

// prepare database link
const db = "mongodb+srv://" + process.env.DBUSERNAME + ":" + process.env.DBPASSWORD + "@" + process.env.DBCLUSTER + "." + process.env.DBSERVER + ".mongodb.net/" + process.env.DBDATABASENAME + "?retryWrites=true&w=majority"

// connect to the database
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true})
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


const httpServer = http.createServer(app);

httpServer.listen(process.env.PORTBACKEND, () => {
  console.log(`HTTP ${process.env.ENVIRONMENT} Backend-Server running on port ${process.env.PORTBACKEND}`);
});
