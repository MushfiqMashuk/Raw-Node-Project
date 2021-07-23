// Dependencies
const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { pathNotFoundHandler } = require('../handlers/pathNotFound');
const { parseJSON } = require('./utilities');

// Scaffolding
const handler = {};

handler.handleReqRes = (req, res) => {
    // handle request
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const requestHeader = req.headers;
    const queryStringObject = parsedUrl.query;

    const requestProperties = {
        parsedUrl,
        path,
        method,
        requestHeader,
        queryStringObject,
    };

    const decoder = new StringDecoder('utf-8');
    let bodyData = '';

    const requestedRoute = routes[path] ? routes[path] : pathNotFoundHandler;

    req.addListener('data', (buffer) => {
        bodyData += decoder.write(buffer);
    });

    req.addListener('end', () => {
        bodyData += decoder.end(); // 'end' method ends the decoding and returns an empty string

        requestProperties.bodyData = parseJSON(bodyData);

        requestedRoute(requestProperties, (statusCode, payload) => {
            const statusCode2 = typeof statusCode === 'number' ? statusCode : 500;
            const payload2 = typeof payload === 'object' ? payload : {};
            const payloadString = JSON.stringify(payload2);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode2);
            res.end(payloadString);
        });

        // handle response
        // res.end('Node App is Running Healthy!');
    });
};

module.exports = handler;
