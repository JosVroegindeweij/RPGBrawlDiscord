const dbHandler = require('../utils/databaseHandler');
const Logger = require('../utils/logger');
const GoogleIntegration = require('../utils/googleIntegration');
const Admin = require('./admin');

const rounds = require('../utils/roundInformation.json');
const {PermissionsBitField, ChannelType} = require("discord.js");
const alphabet = 'ABCDEFGH';

async function execute(message, matches) {
    message.reply(`Attempting to create matches`)
        .catch(console.error);
    let guild = message.guild;
    try {
        for (let match of matches) {
            if (rounds[match]) {
                await makeRound(guild, rounds[match]);
            }
        }
    } catch (err) {
        Logger.error(err, guild);
    }
}

async function makeRound(guild, round) {
    let playoffsRolePosition = guild.roles.cache.find(r => r.name === 'playoffs').position;
    let roundRole = await guild.roles.create({
        name: round.name,
        color: round.color,
        hoist: true,
        position: playoffsRolePosition + round.position
    }
    );

    let spreadsheetData = (await dbHandler.getSpreadsheetRange(guild, 'login'))[0];
    let spreadsheetID = spreadsheetData.spreadsheet;
    let loginRanges = [];
    for (let i = 0; i < round.nrMatches; i++) {
        let range = round.sheet + '!' + alphabet[i] + '18:' + alphabet[i] + '21';
        loginRanges.push(range);
    }

    GoogleIntegration.call(GoogleIntegration.getBatch, [
        spreadsheetID,
        loginRanges,
        makeMatches
            .bind(null, guild, round, roundRole)
    ]);
}

async function makeMatches(guild, round, roundRole, matches) {
    let adminIds = await Admin.getActiveAdmins(guild);
    let botRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'rpg brawl bot');
    let staffRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'staff');
    let everyoneRole = guild.roles.everyone;

    matches = matches.map(match => match.values[0]);

    let matchCategory = await guild.channels.create({
        name: roundRole.name,
        type: ChannelType.GuildCategory,
        position: 4,
        permissionOverwrites: [
            {
                id: everyoneRole.id,
                deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
            },
            {
                id: roundRole.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
            },
            {
                id: botRole.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
            },
            ...adminIds.map(admin => ({
                id: admin,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
            }))
        ]
    });

    for (let i = 0; i < matches.length; i++) {
        let matchName = roundRole.name + '-' + alphabet[i];
        let matchRole = await guild.roles.create({ name: matchName });

        let matchChannel = await guild.channels.create({
            name: matchName,
            parent: matchCategory,
            permissionOverwrites: [
                {
                    id: everyoneRole.id,
                    deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                },
                {
                    id: roundRole.id,
                    deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                },
                {
                    id: matchRole.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                },
                {
                    id: botRole.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                },
                ...adminIds.map(admin => ({
                    id: admin,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                }))
            ]
        });

        let members = []
        for (let j = 0; j < 4; j++) {
            let link = (await dbHandler.getPlayerLink(guild, {login: matches[i][j]}))[0];
            if (link) {
                let member = await guild.members.fetch(link.discord_id);
                if (member) {
                    members.push(member);
                    await member.roles.add(roundRole);
                    await member.roles.add(matchRole);
                }
            }
        }

        if (round.deftimeSun) {
            await matchChannel.send(
                `🇬🇧\n` +
                `Hey ${roundRole}, you have qualified for the next round.\n\n` +
                `This channel is for the 4 of you to agree on a match date. `+
                `Default time will be this Saturday, 20:00 CET and the only way ` +
                `this changes is if every player agrees. If there are special circumstances, ` +
                `tag the ${staffRole} and we will try to resolve it. ` +
                `Also tag us if the match is scheduled, so we can make a server ready at that time!\n\n` +
                `Banning will take place in the server, when the match starts. glhf!\n\n` +
                `Ban order:\n` +
                `1: ${matches[i][3]} - ${members[3]}\n` +
                `2: ${matches[i][2]} - ${members[2]}\n` +
                `3: ${matches[i][1]} - ${members[1]}\n` +
                `4: ${matches[i][0]} - ${members[0]}\n` +
                `🇫🇷\n` +
                `Hey ${roundRole}, vous êtes qualifié pour le prochain match.\n\n` +
                `Ce channel est pour que vous décidiez d'une date de match entre vous 4. ` +
                `Le jour et l'heure par défaut seront le samedi à 20h CET et la seule facon ` +
                `pour que cela change et que tous les joueurs soient d'accord. ` +
                `S'il y a des circonstances particulières, ping les ${staffRole} ` +
                `et nous essaierons de les résoudre. ` +
                `Vous devez aussi nous ping si l'heure et le jour ont été décidés, ` +
                `pour que nous puissions avoir un serveur prêt à ce moment là!\n\n` +
                `Le ban des maps aura lieu sur le serveur, au début du match. glhf!\n\n` +
                `Ordre des bans:\n` +
                `1: ${matches[i][3]} - ${members[3]}\n` +
                `2: ${matches[i][2]} - ${members[2]}\n` +
                `3: ${matches[i][1]} - ${members[1]}\n` +
                `4: ${matches[i][0]} - ${members[0]}\n`
            );
        } else {
            await matchChannel.send(
                `🇬🇧\n` +
                `Hey ${roundRole}, you have qualified for the next round.\n\n` +
                `This channel is for the 4 of you to agree on a match date. `+
                `Default time will be this Sunday, 20:00 CET and the only way ` +
                `this changes is if every player agrees. If there are special circumstances, ` +
                `tag the ${staffRole} and we will try to resolve it. ` +
                `Also tag us if the match is scheduled, so we can make a server ready at that time!\n\n` +
                `Banning will take place in the server, when the match starts. glhf!\n\n` +
                `Ban order:\n` +
                `1: ${matches[i][3]} - ${members[3]}\n` +
                `2: ${matches[i][2]} - ${members[2]}\n` +
                `3: ${matches[i][1]} - ${members[1]}\n` +
                `4: ${matches[i][0]} - ${members[0]}\n` +
                `🇫🇷\n` +
                `Hey ${roundRole}, vous êtes qualifié pour le prochain match.\n\n` +
                `Ce channel est pour que vous décidiez d'une date de match entre vous 4. ` +
                `Le jour et l'heure par défaut seront le dimanche à 20h CET et la seule facon ` +
                `pour que cela change et que tous les joueurs soient d'accord. ` +
                `S'il y a des circonstances particulières, ping les ${staffRole} ` +
                `et nous essaierons de les résoudre. ` +
                `Vous devez aussi nous ping si l'heure et le jour ont été décidés, ` +
                `pour que nous puissions avoir un serveur prêt à ce moment là!\n\n` +
                `Le ban des maps aura lieu sur le serveur, au début du match. glhf!\n\n` +
                `Ordre des bans:\n` +
                `1: ${matches[i][3]} - ${members[3]}\n` +
                `2: ${matches[i][2]} - ${members[2]}\n` +
                `3: ${matches[i][1]} - ${members[1]}\n` +
                `4: ${matches[i][0]} - ${members[0]}\n`
            );
        }
    }
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
