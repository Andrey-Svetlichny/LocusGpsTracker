// Decode data from GPS Tracker GT06
// Copyright © 2018 Andrey Svetlichny. All rights reserved.
// Licensed under the Apache License, Version 2.0

module.exports = class DecoderGT06 {
    static decodeGpsData(data, login, location, error) {
        while (data.length > 0) {
            // console.log('data.length=' + data.length);
            let res = this.decodeChunk(data);
            if (res.location && location) location(res.location);
            if (res.loginMessage && login) login(res.loginMessage);
            if (res.error && error) error(res.error);
            // skip chunkSize or search for next Start Bit
            let x = res.chunkSize ? res.chunkSize : data.indexOf('xx', 1);
            if (x < 0) break;
            data = data.slice(x);
        }
    }

    static decodeChunk(data) {
        if (data.length < 3 || data.readInt16BE(0) !== 0x7878) {
            return {error: 'Wrong Start Bit'};
        }

        let packetLength = data.readUInt8(2);
        if (data.length < packetLength + 5 || data.readInt16BE(packetLength + 3) !== 0x0d0a) {
            return {error: 'Wrong Stop Bit'};
        }

        let protocolNumber = data.readUInt8(3);
        // let infSerialNumber = data.readUInt16BE(packetLength - 1);
        // let errorCheck = data.readUInt16BE(packetLength + 1);

        if (protocolNumber === 1) { // Login Message
            return {
                chunkSize: packetLength + 5,
                loginMessage: {imei: data.slice(4, packetLength - 1).toString('hex')}
            };
        } else if (protocolNumber === 0x12) { // Location Data
            if (packetLength !== 0x1F) {
                return {error: 'Wrong packetLength'};
            }
            let loc = {
                chunkSize: packetLength + 5,
                type: 2,
                year: data.readUInt8(4),
                month: data.readUInt8(5),
                day: data.readUInt8(6),
                hour: data.readUInt8(7),
                minute: data.readUInt8(8),
                second: data.readUInt8(9),
                satellites: data.readUInt8(10),
                lat: data.readUIntBE(11, 4) / 1800000.0,
                lon: data.readUIntBE(15, 4) / 1800000.0,
                speed: data.readUInt8(19)
            };
            loc.time = new Date(Date.UTC(2000 + loc.year, loc.month - 1, loc.day, loc.hour, loc.minute, loc.second, 0));

            return {
                chunkSize: packetLength + 5,
                location: loc
            };
        } else {
            return {
                chunkSize: packetLength + 5,
                error: 'Wrong protocolNumber = ' + protocolNumber
            };
        }
    };
};
