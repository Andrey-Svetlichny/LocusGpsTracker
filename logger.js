// Decode data from GPS Tracker GT06
// Copyright © 2018 Andrey Svetlichny. All rights reserved.
// Licensed under the Apache License, Version 2.0

const fs = require('fs');
const DecoderGT06 = require('./decoder');
const GpxBuilder = require('./gpx-builder');
const trackFilePrefix = './data/track_';

class Logger {

    constructor() {
        this.gpxBuilder = new GpxBuilder('./data/tmp-content.gpx');
        this.points = [];
        this.maxPoints = 1000;
        this.lastLocation = {};
        const path = this.getLogPath();
        if (fs.existsSync(path))
            this.processData(fs.readFileSync(path));
    }

    addRaw(data) {
        const path = this.getLogPath();
        fs.appendFileSync(path, data);
        this.processData(data);
    }

    processData(data) {
        DecoderGT06.decodeGpsData(data,
            login => Logger.logLogin(login),
            loc => { Logger.logLocation(loc);
                // if (this.lastLocation && this.lastLocation.lat === loc.lat && this.lastLocation.lon === loc.lon)
                this.points.push(this.gpxBuilder.location(loc));
                this.points = this.points.slice(0, this.maxPoints);
            },
            error => Logger.logError(error)
        );
    }

    getGpx() {
        return this.gpxBuilder.header() + this.points.join(' ') + this.gpxBuilder.footer();
    }

    getLogPath() {
        // path for current date
        return trackFilePrefix + new Date().toISOString().split('T')[0] + '.bin';
    }

    static logLogin(login) {console.log('LOGIN MESSAGE; IMEI=' + login.imei)};
    static logLocation(loc) {console.log('LOCATION DATA; Date=\'' + loc.time.toISOString() + '\' ' + 'sat=' + loc.satellites + '; '
        + 'lat=' + loc.lat.toFixed(6) + '; ' + 'lon=' + loc.lon.toFixed(6) + '; ' + 'speed=' + loc.speed); };
    static logError(error) {console.log('ERROR: ' + error)};

}
module.exports = Logger;