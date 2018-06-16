'use strict';
const fs = require('fs');
const DecoderGT06 = require('./decoder');
// const GpxBuilder = require('./gpx-builder');

/*
var data1 = Buffer.from(fs.readFileSync('./test-data/1.log'));
var data2 = Buffer.from(fs.readFileSync('./test-data/2.log'));

DecoderGT06.decodeGpsData(data1);
DecoderGT06.decodeGpsData(data2);
*/


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



const data = fs.readFileSync('./test-data/data.log');
const gpxBuilder = new GpxBuilder('./test-data/test.gpx');
gpxBuilder.writeHeader();
DecoderGT06.decodeGpsData(data,
    login => console.log('LOGIN MESSAGE; IMEI=' + login.imei),
    loc => {
        console.log('LOCATION DATA; Date=\'' + loc.time.toISOString() + '\' ' + 'sat=' + loc.satellites + '; '
            + 'lat=' + loc.lat.toFixed(6) + '; ' + 'lon=' + loc.lon.toFixed(6) + '; ' + 'speed=' + loc.speed);
        gpxBuilder.writeLocation(loc);
    },
    error => console.log('ERROR: ' + error)
);
gpxBuilder.writeFooter();
console.log('Done');
