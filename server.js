// Server for monitoring GPS tracker in LocusMap (android)
// Copyright © 2018 Andrey Svetlichny. All rights reserved.
// Licensed under the Apache License, Version 2.0

const fs = require('fs');
const net = require('net');
const DecoderGT06 = require('./decoder');
const GpxBuilder = require('./gpx-builder');
const gpxBuilder = new GpxBuilder('./data/tmp-content.gpx');
const trackFilePrefix = './data/track_';

const server = net.createServer((c) => {
    // 'connection' listener
    console.log('client connected');
    c.on('end', () => {
        console.log('client disconnected');
    });
    c.on('data', (data) => {
        console.log('data');

        if(('' + data).startsWith('GET /')) { // Locus connected via HTTP - send GPX file
            console.log('HTTP GET');
            const gpx = gpxBuilder.getGpx();
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
            let path = trackFilePrefix + new Date().toISOString().split('T')[0] + '.bin';
            fs.appendFileSync(path, data);

            DecoderGT06.decodeGpsData(data,
                login => console.log('LOGIN MESSAGE; IMEI=' + login.imei),
                loc => {
                    console.log('LOCATION DATA; Date=\'' + loc.time.toISOString() + '\' ' + 'sat=' + loc.satellites + '; '
                        + 'lat=' + loc.lat.toFixed(6) + '; ' + 'lon=' + loc.lon.toFixed(6) + '; ' + 'speed=' + loc.speed);
                    gpxBuilder.writeLocation(loc);
                },
                error => console.log('ERROR: ' + error)
            );
        }
    });
});
server.on('error', (err) => {
    throw err;
});
server.listen(20300, () => {
    console.log('TCP and HTTP Server running on port 20300');
});
