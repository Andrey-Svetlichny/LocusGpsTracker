'use strict';
const fs = require('fs');
// const DecoderGT06 = require('./decoder');
// const GpxBuilder = require('./gpx-builder');

const Logger = require('./logger');
const logger = new Logger();


const data = fs.readFileSync('./test-data/track.bin');

logger.addRaw(data);
console.log('*** - ***');

console.log(logger.getGpx());

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
console.log('Done');
