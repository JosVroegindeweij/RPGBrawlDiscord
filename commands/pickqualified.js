const dbHandler = require('../utils/databaseHandler');
const Logger = require('../utils/logger');
const Admin = require('admin');

async function execute(message) {
    let guild = message.guild;

    // TODO Get qualified list here

    try {
        let roleInformation = await getRolesAndPermissionOverwrites(guild);

        let channels = await dbHandler.getChannels(guild);

        let channelManager = guild.channels;
        let category = guild.channels.cache.get(channels['category']);

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
            `🇫🇷\n`
        );

        const filterAccept = (reaction, _) => reaction.emoji.name === '✅';
        const filterDeny = (reaction, _) => reaction.emoji.name === '❌';

        const collectorAccept = message.createReactionCollector(filterAccept);
        const collectorDeny = message.createReactionCollector(filterDeny);

        collectorAccept.on('collect', (_, user) => {
            const member = guild.member(user);
            if (member) {
                member.roles.remove(roleInformation.qualified);
                member.roles.add(roleInformation.playoffs);
            }
        });

        collectorDeny.on('collect', _ => {
            // Send confirmation message whether they want to drop out
            message.channel.send(
                `🇬🇧 Are you sure you want to drop out?\n🇫🇷`
            ).then(confirmation => {
                const collectorConfirmationAccept = confirmation.createReactionCollector(filterAccept);
                const collectorConfirmationDeny = confirmation.createReactionCollector(filterDeny);

                collectorConfirmationAccept.on('collect', (_, user) => {
                    const member = guild.member(user);
                    if (member) {
                        member.roles.remove(roleInformation.qualified);
                        member.roles.add(roleInformation.dropouts);
                    }
                });
                collectorConfirmationDeny.on('collect', (_, user) => {
                    confirmation.delete().catch(reason => Logger.error(reason, guild));
                });

                message.react('✅').catch(reason => Logger.error(reason, guild));
                message.react('❌').catch(reason => Logger.error(reason, guild));
            })
        });

        await message.react('✅');
        await message.react('❌');


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