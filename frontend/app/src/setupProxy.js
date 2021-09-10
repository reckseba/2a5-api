const { createProxyMiddleware } = require('http-proxy-middleware');
const filter = function (pathname, req) {
    /*
    pathname will be sth like:

    /favicon.ico
    /manifest.json
    /logo192.png
    /FMfrY                      <----- we want this
    /static/js/bundle.js.map
    /static/js/0.chunk.js.map
    /static/js/main.chunk.js.map
    */

    const regex = /^\/[A-Za-z0-9]{3,5}/gm;

    return pathname.match(regex) && pathname.length >= (3+1) && pathname.length <= (5+1) && req.method === 'GET';
  };

module.exports = function(app) {

    app.use(
        '/newUrlLong',
        createProxyMiddleware({
            target: 'http://localhost:5000',
            changeOrigin: true
        })
    );

    app.use(
        '/*',
        createProxyMiddleware(filter, {
            target: 'http://localhost:5000',
            changeOrigin: true
        })
    );


};