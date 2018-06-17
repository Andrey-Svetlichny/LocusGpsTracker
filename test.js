'use strict';
const fs = require('fs');
const DecoderGT06 = require('./decoder');
const GpxBuilder = require('./gpx-builder');

const data = fs.readFileSync('./test-data/track.bin');
const gpxBuilder = new GpxBuilder('./test-data/tmp-content.gpx');
gpxBuilder.reset();
DecoderGT06.decodeGpsData(data,
    login => console.log('LOGIN MESSAGE; IMEI=' + login.imei),
    loc => {
        console.log('LOCATION DATA; Date=\'' + loc.time.toISOString() + '\' ' + 'sat=' + loc.satellites + '; '
            + 'lat=' + loc.lat.toFixed(6) + '; ' + 'lon=' + loc.lon.toFixed(6) + '; ' + 'speed=' + loc.speed);
        gpxBuilder.writeLocation(loc);
    },
    error => console.log('ERROR: ' + error)
);
fs.writeFileSync('./test-data/test.gpx', gpxBuilder.getGpx());
console.log('Done');
