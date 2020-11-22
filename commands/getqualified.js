const {spreadsheetID} = require('../config.json')
const {call, getRange} = require('../googleIntegration.js')
const AsciiTable = require('ascii-table')

let response;
let latestRequest;
let logins;
let avgs;
let client;
let scheduledTask;

function execute(message) {
    if (!scheduledTask) {
        scheduledTask = setInterval(execute, 600 * 1000);
    }
    if (!client) {
        client = message.client;
    }
    latestRequest = message;
    call(getRange, [spreadsheetID, 'SR1!AC3:AC42', saveLogins]);
    call(getRange, [spreadsheetID, 'SR1!AA3:AA42', saveAvgs]);
}

function stop_scheduler() {
    if (scheduledTask) {
        clearInterval(scheduledTask);
    }
}

function saveLogins(l) {
    logins = l;
    replyRange();
}

function saveAvgs(a) {
    avgs = a;
    replyRange();
}

function replyRange() {
    if (!(logins && logins.length) || !(avgs && avgs.length)) return;
    let table = generateTable();

    let delimiter = /\n\+-+\+/;
    let border = /\n\|\s*33/;
    table = table.insert(table.search(border), table.match(delimiter)[0]);

    if (latestRequest){
        latestRequest.delete();
    }
    if (!response) {
        latestRequest.channel.send('```\n' + table + '```')
            .then(message => response = message);
    } else {
        response.edit('```\n' + table + '```')
    }
    logins = [];
    avgs = [];
}

function generateTable() {
    let table = new AsciiTable('TA Rankings');
    table.setBorder('|', '-', '+', '+');
    table.setHeading('Rank', 'login' /* possibly linked discord name later */, 'avg');
    logins.forEach((login, index) => {
        let avg = round(+(avgs[index][0].replace(/,/, '.')), 1);
        table.addRow(index + 1, login, avg);
    })
    table.setAlign(0, AsciiTable.RIGHT);
    table.setAlign(1, AsciiTable.CENTER);
    table.setAlign(2, AsciiTable.LEFT);
    return table.toString();
}

function round(value, precision) {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

String.prototype.insert = function (index, string) {
    if (index > 0) {
        return this.substring(0, index) + string + this.substr(index);
    }
    return string + this;
};


module.exports = {
    name: 'getqualified',
    aliases: ['update', 'gq'],
    description: 'Gets list of qualified players from spreadsheet and pastes them in the channel',
    execute,
    stop_scheduler,
    syntax: '!getqualified',
}