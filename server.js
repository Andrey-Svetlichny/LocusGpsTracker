// Server for monitoring GPS tracker in LocusMap (android)
// Copyright © 2018 Andrey Svetlichny. All rights reserved.
// Licensed under the Apache License, Version 2.0

process.env.TZ = 'Europe/Moscow'; // does not work in windows

const net = require('net');
const querystring = require('querystring');
const Logger = require('./logger');
const logger = new Logger();

function parseHttpHeader(header) {
    const match = /(^[^ ]+) ([^? ]+)(\?([^ ]+))?/m.exec(header);
    return {
        method: match[1],
        url: match[2],
        params: querystring.parse(match[4])
    };
}
const server = net.createServer((c) => {
    server.getConnections((err, count) => console.log("client connected " + count));
    c.on('end', () => console.log('client disconnected'));
    c.on('data', (data) => {
        // console.log('data');
        if(('' + data).startsWith('GET ')) {
            const header = parseHttpHeader(data);
            if (header.url === '/gpx') { // Locus connected via HTTP - send GPX file
                console.log('HTTP GET /gpx; params=', header.params);
                const gpx = logger.getGpx(parseInt(header.params.limit) || 0);
                c.write(
                    'HTTP/1.1 200 OK\r\n' +
                    'Accept-Ranges: bytes\r\n' +
                    'Cache-Control: public, max-age=0\r\n' +
                    'Content-Type: application/gpx+xml\r\n' +
                    'Content-Length: ' + gpx.length + '\r\n' +
                    '\r\n');
                c.write(gpx);
            } else if (header.url === '/status') { // Browser connected via HTTP - send status page
                console.log('HTTP GET /status');
                c.write(
                    'HTTP/1.1 200 OK\r\n' +
                    'Cache-Control: public, max-age=0\r\n' +
                    'Content-type: text/html\r\n' +
                    '\r\n');
                c.end(logger.status());
            } else {
                console.log('HTTP GET ' + header.url);
                c.end();
            }
        } else { // Tracker connected via TCP - decode and save GPS data
            console.log('TCP');
            logger.addRaw(data);
        }
    });
    c.on('error', (err) => {
        if (err.code === 'ECONNRESET')
            console.log('client disconnected (ECONNRESET)');
        else
            console.log(err.stack);
    });
});
server.on('error', (err) => {
    throw err;
});
server.listen(20300, () => {
    console.log('TCP and HTTP Server running on port 20300');
});
