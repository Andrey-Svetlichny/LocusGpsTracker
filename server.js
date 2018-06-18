// Server for monitoring GPS tracker in LocusMap (android)
// Copyright © 2018 Andrey Svetlichny. All rights reserved.
// Licensed under the Apache License, Version 2.0

const net = require('net');
const Logger = require('./logger');
const logger = new Logger();

const server = net.createServer((c) => {
    server.getConnections((err, count) => console.log("client connected " + count));
    c.on('end', () => console.log('client disconnected'));
    c.on('data', (data) => {
        console.log('data');
        if(('' + data).startsWith('GET /')) { // Locus connected via HTTP - send GPX file
            console.log('HTTP GET');
            const gpx = logger.getGpx();
            c.write(
                'HTTP/1.1 200 OK\r\n' +
                'Accept-Ranges: bytes\r\n' +
                'Cache-Control: public, max-age=0\r\n' +
                'Content-Type: application/gpx+xml\r\n' +
                'Content-Length: ' + gpx.length + '\r\n' +
                '\r\n');
            c.write(gpx);
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
