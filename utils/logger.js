const fs = require('fs');

const Utils = require('./utils');

let Logger = {}
let infoStream = fs.createWriteStream("logs/info.txt", {flags: 'a'});
let errorStream = fs.createWriteStream("logs/error.txt", {flags: 'a'});

Logger.info = (message, guild) => {
    infoStream.write(`${Utils.timestamp()} [${guild?.name || guild}] ${message}\n`);
};

Logger.error = (message, guild) => {
    errorStream.write(`${Utils.timestamp()} [${guild?.name || guild}] ${message}\n`);
};

module.exports = Logger;