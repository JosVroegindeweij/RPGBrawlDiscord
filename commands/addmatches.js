const dbHandler = require('../utils/databaseHandler');
const Logger = require('../utils/logger');
const GoogleIntegration = require('../utils/googleIntegration');

let rounds = require('../utils/roundInformation.json');

async function execute(message, matches) {
    let guild = message.guild;
    try {
        for (let match of matches) {
            if (rounds[match]) {
                await makeRound(guild, rounds[match]);
            } else if (rounds[match.slice(0, -2)]) {
                await makeMatch(guild, rounds[match.slice(0, -2)], match);
            }
        }
    } catch (err) {
        Logger.error(err, guild);
    }
}

async function makeRound(guild, round) {
    let playoffsRolePosition = guild.roles.cache.find(r => r.name === 'playoffs').position;
    let roundRole = await guild.roles.create({
        data: {
            name: round.name,
            color: round.color,
            hoist: true,
            position: playoffsRolePosition + round.position
        }
    });

    let spreadsheetData = (await dbHandler.getSpreadsheetRange(guild, 'loginQualified'))[0];
    let spreadsheetID = spreadsheetData.spreadsheet;
    let loginRanges = [];
    for (let i = 0; i < round.nrMatches; i++) {
        let range = round.sheet + '!';
        let rangeStart = round.startRow + i * (4 + round.diffRanges);
        range += round.column + rangeStart + ':' + round.column + (rangeStart + 3);
        loginRanges.push(range);
    }

    GoogleIntegration.call(GoogleIntegration.getBatch, [
        spreadsheetID,
        loginRanges,
        makeMatches
    ]);
}

function makeMatches(matches) {
    console.log(matches);
}

async function getSpreadsheetData() {

}

function makeMatch(guild, round, match) {
    // TODO implement
}


module.exports = {
    name: 'addmatches',
    aliases: ['am', 'matches'],
    description: 'Adds a new match, creates channel for the match.',
    execute,
    syntax: '{!addmatches | !am | !matches} match',
    channel: 'staff',
    admin: true
};