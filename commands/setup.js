const Logger = require('../utils/logger');
const dbHandler = require('../utils/databaseHandler');
const Admin = require('./admin')

async function execute(message, args) {
    let guild = message.guild;

    if ((await dbHandler.getChannels(guild))?.category &&
        (!(args.includes('--force') || args.includes('-f')))) {
        message.reply(`This server already has a bot category.`)
            .catch(reason => Logger.error(reason, guild));
        return;
    }

    Admin.addAdmins(message);

    let channelManager = guild.channels;
    let permissionsOverwrite = await getPermissionOverwrites(guild);

    channelManager.create('RPG Brawl bot', {
        type: 'category'
    })
        .then(category => {
            Logger.info(`Created bot channel category (${category.id})`, guild)
            Promise.all([
                channelManager.create('staff', {
                    topic: 'Staff commands' +
                        buildTopic(message.client.commands, 'staff'),
                    parent: category,
                    permissionOverwrites: permissionsOverwrite['staff']
                }),
                channelManager.create('ta-standings', {
                    topic: 'TA standings updates' +
                        buildTopic(message.client.commands, 'ta-standings'),
                    parent: category,
                    permissionOverwrites: permissionsOverwrite['ta-standings']
                }),
                channelManager.create('linking', {
                    topic: 'Linking trackmania logins with discord users' +
                        buildTopic(message.client.commands, 'linking'),
                    parent: category
                })
            ])
                .then(channels => {
                    Logger.info(`Created bot channels (${channels[0].name}: ${channels[0].id}, ` +
                        `${channels[1].name}: ${channels[1].id}, ${channels[2].name}: ${channels[2].id})`, guild);
                    dbHandler.saveChannels(
                        guild,
                        category,
                        channels[0],
                        channels[1],
                        channels[2]
                    )
                })
                .catch(reason => Logger.error(reason, message.guild));
        })
        .catch(reason => Logger.error(reason, message.guild));
}

async function findChannelId(guild, channelName) {
    let channels = await dbHandler.getChannels(guild);
    return channels?.hasOwnProperty(channelName) ? channels[channelName] : undefined;
}

function buildTopic(commands, channelName) {
    let topic = ' -';
    for (let cmd of commands) {
        if (cmd[1].channel === channelName) {
            topic += ' ' + cmd[1].syntax + ' -';
        }
    }
    return topic;
}

async function getPermissionOverwrites(guild) {
    let adminIds = (await dbHandler.getAdmins(guild)).map(adm => adm.admin);
    // Fetch all admins to make sure they are in cache
    const adminUsersInGuild = (await guild.members.fetch({user: adminIds}))?.array() ?? [];
    const adminRolesInGuild = (await guild.roles.fetch({user: adminIds}))?.array() ?? [];

    // Remove admins that left the guild
    let activeAdmins = adminUsersInGuild
        .concat(adminRolesInGuild)
        .map(a => a.id);
    adminIds = adminIds.filter(admin => activeAdmins.includes(admin));
    let everyone_role = guild.roles.everyone;
    let bot_role = guild.roles.cache.find(r => r.name.toLowerCase() === 'rpg brawl bot');

    return {
        'staff': [
            {
                id: everyone_role.id,
                deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            },
            {
                id: bot_role.id,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            },
            ...adminIds.map(admin => ({
                id: admin,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            }))
        ],
        'ta-standings': [
            {
                id: everyone_role.id,
                deny: ['SEND_MESSAGES']
            },
            {
                id: bot_role.id,
                allow: ['SEND_MESSAGES']
            },
            ...adminIds.map(admin => ({
                id: admin,
                allow: ['SEND_MESSAGES']
            }))
        ]
    };
}

module.exports = {
    name: 'setup',
    description: 'Sets up the use of RPG Brawl bot on a server',
    execute,
    findChannelId,
    syntax: '!setup [{-f|--force}] [{role|user}...]',
    channel: 'staff',
    admin: true
}