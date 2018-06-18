// Make GPX from GPS tracker data
// Copyright © 2018 Andrey Svetlichny. All rights reserved.
// Licensed under the Apache License, Version 2.0

'use strict';
const fs = require('fs');

class GpxBuilder {
    constructor() {
        this.headerPath = './gpx-header.txt';
        this.footerPath = './gpx-footer.txt';

        this.headerText = fs.readFileSync('./gpx-header.txt');
        this.footerText = fs.readFileSync('./gpx-footer.txt');
    }

    header() {
        return this.headerText;
    }

    footer() {
        return this.footerText;
    }

    location(loc) {
        return '<trkpt lat="' + loc.lat.toFixed(6) + '" lon="' + loc.lon.toFixed(6) + '">\n'
            + '\t<time>' + loc.time.toISOString() + '</time>\n'
            + '</trkpt>\n';
    }
}
module.exports = GpxBuilder;