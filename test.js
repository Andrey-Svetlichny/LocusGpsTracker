'use strict';
const fs = require('fs');
const querystring = require('querystring');
// const DecoderGT06 = require('./decoder');
// const GpxBuilder = require('./gpx-builder');

const Logger = require('./logger');


const header = 'GET /?key=f450&limit=0 HTTP/1.1\n' +
    'User-Agent: Locus/3.31.0 (Linux; U; Android; en-us)\n' +
    'Host: xxx.compute.amazonaws.com:3000\n' +
    'Connection: Keep-Alive\n' +
    'Accept-Encoding: gzip';

function parseHttpHeader(header) {
    const match = /(^[^ ]+) ([^? ]+)(\?([^ ]+))?/m.exec(header);
    return {
        method: match[1],
        url: match[2],
        params: querystring.parse(match[4])
    };
}

const h = parseHttpHeader(header);

console.log('', h.params);
console.log(h.params.limit);

/*
const data = fs.readFileSync('./test-data/track.bin');

const logger = new Logger();
console.log('*** - ***');
// logger.addRaw(data);
console.log(logger.status());
// console.log(logger.getGpx());
console.log('Done');
*/

// const gpxBuilder = new GpxBuilder('./test-data/tmp-content.gpx');
// DecoderGT06.decodeGpsData(data,
//     login => console.log('LOGIN MESSAGE; IMEI=' + login.imei),
//     loc => {
//         console.log('LOCATION DATA; Date=\'' + loc.time.toISOString() + '\' ' + 'sat=' + loc.satellites + '; '
//             + 'lat=' + loc.lat.toFixed(6) + '; ' + 'lon=' + loc.lon.toFixed(6) + '; ' + 'speed=' + loc.speed);
//         gpxBuilder.location(loc);
//     },
//     error => console.log('ERROR: ' + error)
// );
// fs.writeFileSync('./test-data/test.gpx', gpxBuilder.getGpx());
