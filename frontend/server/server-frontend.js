const express = require('express');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const helmet = require('helmet');
const crypto = require('crypto');
require('dotenv').config({path: './config/process.env'});

// init the express server
const app = express();

// prepare a filter for incoming short URL requests. Those we need to catch and proxy to backend
const filter = function (pathname, req) {
        const regex = /^\/[A-Za-z0-9]{3,5}/gm;
        return pathname.match(regex) && pathname.length >= (3+1) && pathname.length <= (5+1) && req.method === 'GET';
};

let credentials = {};

// http-proxy-middleware can detect self signed certificates. If we detect such, we block to preved mitm attacks
let secureProxy = true;

if(process.env.PROTOCOL == "https") {

	if(["test", "local"].includes(process.env.ENVIRONMENT)) {
		// Certificate
		credentials.key = fs.readFileSync(`./ssl/test.privkey.pem`, 'utf8');
		credentials.cert = fs.readFileSync(`./ssl/test.cert.pem`, 'utf8');
		
		// but if we are testing: We only have self signed certificates
		secureProxy = false;
	}

	if(process.env.ENVIRONMENT == "prod") {

		// request was via http, so redirect to https
		app.use (function (req, res, next) {
			if (req.secure) {
				next();
			} else {
				res.redirect('https://' + req.headers.host + req.url);
			}
		});

		credentials.key = fs.readFileSync(`./ssl/privkey.pem`, 'utf8');
		credentials.cert = fs.readFileSync(`./ssl/cert.pem`, 'utf8');
		credentials.ca = fs.readFileSync(`./ssl/chain.pem`, 'utf8');
		
		app.use((req, res, next) => {
			res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
			next();
		});

		app.use(
			helmet.contentSecurityPolicy({
				useDefaults: true,
				directives: {
					scriptSrc: [
						"'self'", 
						(req, res) => `'nonce-${res.locals.cspNonce}'`
					],
				},
			})
		);

	}

}

app.use(
	'/newUrlLong',
	createProxyMiddleware({
		target: `${process.env.PROTOCOL}://${process.env.BACKENDHOST}:${process.env.PORTBACKEND}`,
		changeOrigin: true,
		secure: secureProxy
	})
);

app.use(
	'/*',
	createProxyMiddleware(filter, {
		target: `${process.env.PROTOCOL}://${process.env.BACKENDHOST}:${process.env.PORTBACKEND}`,
		changeOrigin: true,
		secure: secureProxy
	})
);


app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
	  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// start https server if defined in config file

if(process.env.PROTOCOL == "https") {

	const httpsServer = https.createServer(credentials, app);

	httpsServer.listen(process.env.PORTFRONTENDHTTPS, () => {
		console.log(`HTTPS Prod-Server running on port ${process.env.PORTFRONTENDHTTPS}`);
	});

}

// we launch an http server in all cases. For testing this will be the one we use to
// interact with our application. But in https mode this will be the one which redirects traffic to https

const httpServer = http.createServer(app);

httpServer.listen(process.env.PORTFRONTENDHTTP, () => {
	console.log(`HTTP Prod-Server running on port ${process.env.PORTFRONTENDHTTP}`);
});

