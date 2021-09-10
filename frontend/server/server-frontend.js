const express = require('express');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const helmet = require('helmet');
require('dotenv').config({path: 'process.env'});

const conf = process.env;

const app = express();

const filter = function (pathname, req) {
        const regex = /^\/[A-Za-z0-9]{3,5}/gm;
        return pathname.match(regex) && pathname.length >= (3+1) && pathname.length <= (5+1) && req.method === 'GET';
};

if(conf.ENVIRONMENT == "prod") {

	// Certificate
	const privateKey = fs.readFileSync(`ssl/privkey.pem`, 'utf8');
	const certificate = fs.readFileSync(`ssl/cert.pem`, 'utf8');
	const ca = fs.readFileSync(`ssl/chain.pem`, 'utf8');

	const credentials = {
		key: privateKey,
		cert: certificate,
		ca: ca
	};

	app.use(helmet());

	// Add a handler to inspect the req.secure flag (see 
	// http://expressjs.com/api#req.secure). This allows us 
	// to know whether the request was via http or https.
	app.use (function (req, res, next) {
		if (req.secure) {
				// request was via https, so do no special handling
				
				res.setHeader(
					'Content-Security-Policy',
					"default-src 'self'; font-src 'self'; img-src 'self' data:; script-src 'self' 'sha256-AAoB7NZRA776ALHTNBNJ0JbtXU4iafu0oepkvAsAGCE='; style-src 'self'; frame-src 'self'"
				);
				
				next();
		} else {
				// request was via http, so redirect to https
				res.redirect('https://' + req.headers.host + req.url);
		}
	});

}

app.use(
	'/newUrlLong',
	createProxyMiddleware({
		target: `${conf.PROTOCOL}://${conf.BACKENDHOST}:${conf.PORTBACKEND}`,
		changeOrigin: true
	})
);

app.use(
	'/*',
	createProxyMiddleware(filter, {
		target: `${conf.PROTOCOL}://${conf.BACKENDHOST}:${conf.PORTBACKEND}`,
		changeOrigin: true
	})
);


app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
	  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

if(conf.ENVIRONMENT == "prod") {

	const httpsServer = https.createServer(credentials, app);

	httpsServer.listen(conf.PORTFRONTENDHTTPS, () => {
		console.log(`HTTPS Prod-Server running on port ${conf.PORTFRONTENDHTTPS}`);
	});

}

const httpServer = http.createServer(app);

httpServer.listen(conf.PORTFRONTENDHTTP, () => {
	console.log(`HTTP Prod-Server running on port ${conf.PORTFRONTENDHTTP}`);
});

