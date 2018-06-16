// Server for monitoring GPS tracker in LocusMap (android)
// Copyright © 2018 Andrey Svetlichny. All rights reserved.
// Licensed under the Apache License, Version 2.0

const fs = require('fs');
const net = require('net');
const DecoderGT06 = require('./decoder');
const outFilePath = './data/track.gpx';

class GpxBuilder {
    constructor(outFilePath) {
        this.headerPath = './gpx-header.txt';
        this.footerPath = './gpx-footer.txt';
        this.outFilePath = outFilePath;
    }

    writeHeader(){
        // fs.createReadStream().pipe(fs.createWriteStream(this.file));
        fs.writeFileSync(this.outFilePath, fs.readFileSync(this.headerPath));
    }

    writeLocation(loc){
        let s = '<trkpt lat="' + loc.lat.toFixed(6) + '" lon="' + loc.lon.toFixed(6) + '">\n'
            + '\t<time>' + loc.time.toISOString() + '</time>\n'
            + '</trkpt>\n';
        fs.appendFileSync(this.outFilePath, s);
    }

    writeFooter(){
        fs.appendFileSync(this.outFilePath, fs.readFileSync(this.footerPath));
    }
}

const gpxBuilder = new GpxBuilder(outFilePath);

const server = net.createServer((c) => {
    // 'connection' listener
    console.log('client connected');
    c.on('end', () => {
        console.log('client disconnected');
    });
    c.on('data', (data) => {
        console.log('data');

        if(('' + data).startsWith('GET /')) {
            // Locus connected via HTTP - send GPX file
            console.log('HTTP GET');

            if(!fs.existsSync(outFilePath)){
                console.log('Track file does not exists: ' + outFilePath);
                // c.write('HTTP/1.1 500 OK\r\n\');
            } else {
                var header = fs.readFileSync('./gpx-header.txt');
                var body = fs.readFileSync('./data/track.gpx');
                var footer = fs.readFileSync('./gpx-footer.txt');
                var data = header + body + footer;
                c.write('HTTP/1.1 200 OK\r\n');
                c.write('Accept-Ranges: bytes\r\n');
                c.write('Cache-Control: public, max-age=0\r\n');
                c.write('Content-Type: application/gpx+xml\r\n');
                c.write('Content-Length: ' + data.length + '\r\n');
                c.write('\r\n');
                c.write(data);
            }
        } else {
            // Tracker connected via TCP - decode and save GPS data
            console.log('TCP');
            let file = './data/data.log';
            fs.appendFileSync(file, data);

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
server.listen(3000, () => {
    console.log('TCP and HTTP Server running on port 3000');
});
