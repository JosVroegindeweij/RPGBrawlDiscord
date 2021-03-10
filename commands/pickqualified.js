const dbHandler = require('../utils/databaseHandler');
const Logger = require('../utils/logger');
const GoogleIntegration = require('../utils/googleIntegration');
const Admin = require('admin');

let members = [];

async function execute(message) {
    let guild = message.guild;

    await getQualified(guild);
}

async function getQualified(guild) {
    let spreadsheetData = (await dbHandler.getSpreadsheetRange(guild, 'login'))[0];
    let spreadsheetID = spreadsheetData.spreadsheet;
    let loginRange = spreadsheetData.range;

    GoogleIntegration.call(GoogleIntegration.getRange, [spreadsheetID, loginRange, handleQualified.bind(guild)]);
}

async function handleQualified(guild, logins) {
    for (let i = 0; i < logins.length; i++) {
        let link = (await dbHandler.getPlayerLink(guild, {login: logins[i][0]}))[0];
        let member = channel.guild.members.fetch(link?.discord_id);
        members.push(member);
    }

    await determinePlayoffPlayers(guild);
}

async function determinePlayoffPlayers(guild) {
    try {
        let roleInformation = await getRolesAndPermissionOverwrites(guild);
        let channels = (await dbHandler.getChannels(guild))[0];
        let channelManager = guild.channels;
        let category = guild.channels.cache.get(channels.category);

        for (let member of members.slice(0, 32)) {
            await member.roles.add(roleInformation.qualified);
        }

        let channel = await channelManager.create('qualified', {
            topic: 'Channel for qualified people to decide whether they want to be qualified',
            parent: category,
            permissionOverwrites: roleInformation.permissionOverwrites
        });
        let message = await channel.send(
            `🇬🇧\n` +
            `Hey ${roleInformation.qualified}, you have qualified for the playoff stage. ` +
            `To make sure we get full matches, we want to know if you plan on playing the playoffs. ` +
            `Of course it's not a problem if you plan to participate, but something unexpected happens and you can't be at your match.\n\n` +
            `If you want to participate, react to this message with ✅, if you want to drop out, react with ❌.\n\n` +
            `🇫🇷\n` +
            `Hey ${roleInformation.qualified}, vous êtes qualifié pour la phase des playoffs. ` +
            `Pour s'assurer que les matchs sont plein, nous voulons savoir si vous comptez jouer les playoffs. ` +
            `Bien sur, ce n'est pas un problème si vous comptez jouer mais qu'un imprévu vous en empêche au dernier moment.\n\n` +
            `Si vous voulez participer, réagissez à ce message avec ✅, si vous voulez vous désister, réagissez avec ❌.\n\n`
        );

        const filterAccept = (reaction, _) => reaction.emoji.name === '✅';
        const filterDeny = (reaction, _) => reaction.emoji.name === '❌';

        const collectorAccept = message.createReactionCollector(filterAccept);
        const collectorDeny = message.createReactionCollector(filterDeny);

        collectorAccept.on('collect', (_, user) => {
            const member = guild.member(user);
            if (member) {
                member.roles.remove(roleInformation.qualified)
                    .then(member => member.roles.add(roleInformation.playoffs))
                    .catch(reason => Logger.error(reason, guild));
            }
        });

        collectorDeny.on('collect', (_, user) => {
            const member = guild.member(user);
            message.channel.send(
                `${member}\n 🇬🇧 Are you sure you want to drop out?\n` +
                `🇫🇷 Etes vous sur de vouloir vous désister?\n`
            ).then(confirmation => {
                const filterAcceptMember = (reaction, user) => member === guild.member(user) && reaction.emoji.name === '✅';
                const filterDenyMember = (reaction, user) => member === guild.member(user) && reaction.emoji.name === '❌';

                const collectorConfirmationAccept = confirmation.createReactionCollector(filterAcceptMember);
                const collectorConfirmationDeny = confirmation.createReactionCollector(filterDenyMember);

                collectorConfirmationAccept.on('collect', (_, user) => {
                    const member = guild.member(user);
                    if (member) {
                        member.roles.remove(roleInformation.qualified)
                            .then(member => member.roles.add(roleInformation.dropouts))
                            .then(_ => {
                                let replacement = members[2 + roleInformation.dropouts.members.size - 1];
                                return replacement.roles.add(roleInformation.qualified);
                            })
                            .then(replacement => {
                                return message.channel.send(
                                    `${replacement}\n` +
                                    `🇬🇧 Please read this message: \n` +
                                    `🇫🇷 s'il vous plaît lis ce message:\n\n${message.url}`
                                );
                            })
                            .catch(reason => Logger.error(reason, guild));
                    }
                });
                collectorConfirmationDeny.on('collect', (_, user) => {
                    confirmation.delete().catch(reason => Logger.error(reason, guild));
                });

                message.react('✅').catch(reason => Logger.error(reason, guild));
                message.react('❌').catch(reason => Logger.error(reason, guild));
            })
        });

        await message.react('✅').catch(reason => Logger.error(reason, guild));
        await message.react('❌').catch(reason => Logger.error(reason, guild));


    } catch (err) {
        Logger.error(err, guild);
    }
}

async function getRolesAndPermissionOverwrites(guild) {
    let adminIds = Admin.getActiveAdmins(guild);
    let everyone_role = guild.roles.everyone;
    let bot_role = guild.roles.cache.find(r => r.name.toLowerCase() === 'rpg brawl bot');

    let qualified = await guild.roles.create({
        data: {
            name: 'qualified'
        }
    });

    let playoffs = await guild.roles.create({
        data: {
            name: 'playoffs',
            color: 'YELLOW'
        }
    });

    let dropouts = await guild.roles.create({
        data: {
            name: 'dropouts'
        }
    });

    return {
        qualified: qualified,
        playoffs: playoffs,
        dropouts: dropouts,
        permissionOverwrites: [
            {
                id: everyone_role.id,
                deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            },
            {
                id: qualified,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            },
            {
                id: playoffs,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            },
            {
                id: dropouts,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            },
            {
                id: bot_role.id,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            },
            {
                id: adminIds.map(admin => ({
                    id: admin
                })),
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            }
        ]
    }
}

module.exports = {
    name: 'pickqualified',
    aliases: ['pq'],
    description: 'Retrieves the list of qualified people and asks qualified players ' +
        'whether they want to participate.',
    execute,
    syntax: '!pickqualified',
    channel: 'staff',
    admin: true
};