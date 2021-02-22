const AsciiTable = require('ascii-table');

const Utils = require('../utils/utils');
const Logger = require('../utils/logger');
const GoogleIntegration = require('../utils/googleIntegration.js');
const dbHandler = require('../utils/databaseHandler');

let response = {};
let latestRequest = {};
let logins = {};
let avgs = {};
let client;
let scheduledTask = {};

async function execute(message) {
    if (!scheduledTask[message.channel.id]) {
        scheduledTask[message.channel.id] = setInterval(execute_requests.bind(null, message.channel), 600 * 1000);
    }
    if (!client) {
        client = message.client;
    }
    latestRequest[message.channel.id] = message;

    let login = (await dbHandler.getSpreadsheetRange(message.guild, 'login'))[0];
    let avg = (await dbHandler.getSpreadsheetRange(message.guild, 'avg'))[0];

    let spreadsheetID = login.spreadsheet;
    let loginRange = login.range;
    let avgRange = avg.range;

    execute_requests(message.channel, spreadsheetID, loginRange, avgRange);
}

function execute_requests(channel, spreadsheetID, loginRange, avgRange) {
    GoogleIntegration.call(GoogleIntegration.getRange, [spreadsheetID, loginRange, saveLogins.bind(null, channel)]);
    GoogleIntegration.call(GoogleIntegration.getRange, [spreadsheetID, avgRange, saveAvgs.bind(null, channel)]);
}

function stop_scheduler(message) {
    if (scheduledTask[message.channel.id]) {
        clearInterval(scheduledTask[message.channel.id]);
    }
}

function saveLogins(channel, l) {
    logins[channel.id] = l;
    replyRange(channel)
        .catch(reason => Logger.error(reason, channel.guild));

}

function saveAvgs(channel, a) {
    avgs[channel.id] = a;
    replyRange(channel)
        .catch(reason => Logger.error(reason, channel.guild));
}

async function replyRange(channel) {
    if (!(logins[channel.id] && logins[channel.id].length) ||
        !(avgs[channel.id] && avgs[channel.id].length)) return;
    let table = await generateTable(channel);

    let delimiter = /\n\+-+\+/;
    let border = /\n\|\s*33/;

    console.log(table);
    console.log(typeof table);

    table = Utils.insert(table, table.match(delimiter)[0], table.search(border));

    if (!latestRequest[channel.id].deleted) {
        latestRequest[channel.id].delete()
            .catch(reason => Logger.error(reason, channel.guild));
    }
    if (!response[channel.id]) {
        channel.send('```\n' + table + '```')
            .then(message => response[channel.id] = message)
            .catch(reason => Logger.error(reason, channel.guild));
    } else {
        response[channel.id].edit('```\n' + table + '```')
            .catch(reason => Logger.error(reason, channel.guild));
    }
    logins[channel.id] = [];
    avgs[channel.id] = [];
}

async function generateTable(channel) {
    let char_regex = /[^A-Za-z0-9 _%/\\!@#$^&*()\-+=<>,.?:;"'{\[}\]|]/g;
    let table = new AsciiTable('TA Rankings');
    table.setBorder('|', '-', '+', '+');
    table.setHeading('Rank', 'player', 'avg');
    for (let index = 0; index < logins[channel.id].length; index++) {
        let link = await dbHandler.getPlayerLink(channel.guild, {login: logins[channel.id][index][0]})
        let user = channel.guild.members.cache.get(link?.discord_id);
        let login = user?.displayName.replace(char_regex, '') || logins[channel.id][index][0];
        let displayName = login.length <= 23 ? login : login.slice(0, 22).concat('…');
        let avg = (+(avgs[channel.id][index][0].replace(/,/, '.'))).toFixed(1);
        table.addRow(index + 1, displayName, avg);
    }
    table.setAlign(0, AsciiTable.RIGHT);
    table.setAlign(1, AsciiTable.CENTER);
    table.setAlign(2, AsciiTable.LEFT);
    return table.toString();
}

module.exports = {
    name: 'getqualified',
    aliases: ['update', 'gq'],
    description: 'Gets list of qualified players from spreadsheet and pastes them in the channel',
    execute,
    stop_scheduler,
    syntax: '{!getqualified | !update | !gq}',
    channel: 'ta-standings',
    admin: true
}