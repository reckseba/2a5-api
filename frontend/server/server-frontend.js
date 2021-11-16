const express = require('express');
const path = require('path');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config({path: './config/process.env'});

// init the express server
const app = express();

// prepare a filter for incoming short URL requests. Those we need to catch and proxy to backend
const filter = function (pathname, req) {
    const regex = /^\/[A-Za-z0-9]{3,5}/gm;
    return pathname.match(regex) && pathname.length >= (3+1) && pathname.length <= (5+1) && req.method === 'GET';
};

// http-proxy-middleware can detect self signed certificates. If we detect such, we block to preved mitm attacks
let secureProxy = false;

app.use(
	'/newUrlLong',
	createProxyMiddleware({
		target: `http://${process.env.BACKENDHOST}:${process.env.PORTBACKEND}`,
		changeOrigin: true,
		secure: secureProxy
	})
);

// route short urls to our backend to read from db what's behind it
app.use(
	'/*',
	createProxyMiddleware(filter, {
		target: `http://${process.env.BACKENDHOST}:${process.env.PORTBACKEND}`,
		changeOrigin: true,
		secure: secureProxy
	})
);

// load static webpage from folder 'build'
app.use(express.static(path.join(__dirname, 'build')));

// index route 2a5.de/ sends index.html from build folder
app.get('/', function (req, res) {
	  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// start express http server - ssl will get handled by nginx or apache
const httpServer = http.createServer(app);

// listen on specified front-end-port
httpServer.listen(process.env.PORTFRONTENDHTTP, () => {
	console.log(`HTTP ${process.env.ENVIRONMENT} Frontend-Server running on port ${process.env.PORTFRONTENDHTTP}`);
});