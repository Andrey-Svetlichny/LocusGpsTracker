// Make GPX from GPS tracker data
// Copyright © 2018 Andrey Svetlichny. All rights reserved.
// Licensed under the Apache License, Version 2.0

'use strict';
const fs = require('fs');

module.exports = class GpxBuilder {
    constructor(tmpFilePath) {
        this.headerPath = './gpx-header.txt';
        this.footerPath = './gpx-footer.txt';
        this.contentPath = tmpFilePath;

        this.header = fs.readFileSync('./gpx-header.txt');
        this.footer = fs.readFileSync('./gpx-footer.txt');

        if (!fs.existsSync(tmpFilePath)) {
            fs.writeFileSync(tmpFilePath, '');
        }
    }

    reset() {
        fs.writeFileSync(this.contentPath, '');
    }

    writeLocation(loc) {
        let s = '<trkpt lat="' + loc.lat.toFixed(6) + '" lon="' + loc.lon.toFixed(6) + '">\n'
            + '\t<time>' + loc.time.toISOString() + '</time>\n'
            + '</trkpt>\n';
        fs.appendFileSync(this.contentPath, s);
    }

    getGpx() {
        const body = fs.readFileSync(this.contentPath);
        return this.header + body + this.footer;
    }
};
