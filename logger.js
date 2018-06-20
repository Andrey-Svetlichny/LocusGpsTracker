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
        this._status = {};
        const path = this.getLogPath();
        if (fs.existsSync(path)) {
            this.addRaw(fs.readFileSync(path), true);
            this._status = {};
        }
    }

    status() {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset=utf-8>\n<title>Info</title>\n</head>\n<body>\n' +
            '<h1>Tracker status</h1>' +
            '<pre style="font-size:18px">' +
            'LastFix = ' + (this._status.LastFix ? this._status.LastFix.toLocaleTimeString() : '-') + '\r\n' +
            'LastMsg = ' + (this._status.LastMsg ? this._status.LastMsg.toLocaleTimeString() : '-') + '\r\n' +
            'Now     = ' + new Date().toLocaleTimeString() +
            '</pre>' +
        '</body>\n</html>';
    }

    addRaw(data, nolog) {
        if (!nolog) {
            fs.appendFileSync(this.getLogPath(), data);
        }
        DecoderGT06.decodeGpsData(data,
            login => Logger.logLogin(login),
            loc => { Logger.logLocation(loc);
                let date = new Date();
                this._status.LastMsg = date;
                if( loc.lat !== 0 ) {
                    this._status.LastFix = date;
                    this.points.push(this.gpxBuilder.location(loc));
                    this.points = this.points.slice(-this.maxPoints);
                }
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