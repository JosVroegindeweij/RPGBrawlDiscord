const Utils = require('../utils/utils');
const Logger = require('../utils/logger');
const {spreadsheetID, loginRange, avgsRange} = require('../secrets/config.json');
const {call, getRange} = require('../utils/googleIntegration.js');
const AsciiTable = require('ascii-table');
const { get_discord_id_by_login } = require('./link.js');

let response = {};
let latestRequest = {};
let logins = {};
let avgs = {};
let client;
let scheduledTask = {};

function execute(message) {
    if (!scheduledTask[message.channel.id]) {
        scheduledTask[message.channel.id] = setInterval(execute_requests.bind(null, message.channel), 600 * 1000);
    }
    if (!client) {
        client = message.client;
    }
    latestRequest[message.channel.id] = message;
    execute_requests(message.channel);
}

function execute_requests(channel) {
    call(getRange, [spreadsheetID, loginRange, saveLogins.bind(null, channel)]);
    call(getRange, [spreadsheetID, avgsRange, saveAvgs.bind(null, channel)]);
}

function stop_scheduler(message) {
    if (scheduledTask[message.channel.id]) {
        clearInterval(scheduledTask[message.channel.id]);
    }
}

function saveLogins(channel, l) {
    logins[channel.id] = l;
    replyRange(channel);

}

function saveAvgs(channel, a) {
    avgs[channel.id] = a;
    replyRange(channel);
}

function replyRange(channel) {
    if (!(logins[channel.id] && logins[channel.id].length) ||
        !(avgs[channel.id] && avgs[channel.id].length)) return;
    let table = generateTable(channel);

    let delimiter = /\n\+-+\+/;
    let border = /\n\|\s*33/;

    table = Utils.insert(table, table.match(delimiter)[0], table.search(border));

    if (!latestRequest[channel.id].deleted) {
        latestRequest[channel.id].delete()
            .catch(reason => Logger.error(reason, guild));
    }
    if (!response[channel.id]) {
        channel.send('```\n' + table + '```')
            .then(message => response[channel.id] = message)
            .catch(reason => Logger.error(reason, guild));
    } else {
        response[channel.id].edit('```\n' + table + '```')
            .catch(reason => Logger.error(reason, guild));
    }
    logins[channel.id] = [];
    avgs[channel.id] = [];
}

function generateTable(channel) {
    let char_regex = /[^A-Za-z0-9 _%/\\!@#$^&*()\-+=<>,.?:;"'{\[}\]|]/g;
    let table = new AsciiTable('TA Rankings');
    table.setBorder('|', '-', '+', '+');
    table.setHeading('Rank', 'player', 'avg');
    logins[channel.id].forEach((login_data, index) => {
        let user = channel.guild.members.cache.get(get_discord_id_by_login(login_data[0]));
        let login = user?.displayName.replace(char_regex, '') || login_data[0];
        let displayName = login.length <= 23 ? login : login.slice(0, 22).concat('…');
        let avg = (+(avgs[channel.id][index][0].replace(/,/, '.'))).toFixed(1);
        table.addRow(index + 1, displayName, avg);
    })
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