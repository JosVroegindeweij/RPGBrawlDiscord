const Logger = require('../utils/logger');
const dbHandler = require('../utils/databaseHandler');
const Admin = require('./admin')
const {Permissions} = require("discord.js");

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
        type: 'CATEGORY'
    })
        .then(category => {
            Logger.info(`Created bot channel category (${category.id})`, guild);
            Promise.all([
                channelManager.create('help', {
                    topic: 'Channel to get help/explanations with/of commands',
                    parent: category
                }),
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
                        `${channels[1].name}: ${channels[1].id}, ${channels[2].name}: ${channels[2].id}, ` +
                        `${channels[3].name}: ${channels[3].id})`, guild);
                    dbHandler.saveChannels(
                        guild,
                        category,
                        channels[0],
                        channels[1],
                        channels[2],
                        channels[3]
                    )
                    channels[0].send(getHelpMessage(guild, category, channels))
                        .catch(reason => Logger.error(reason, message.guild));
                })
                .catch(reason => Logger.error(reason, message.guild));
        })
        .catch(reason => Logger.error(reason, message.guild));
}

async function findChannelId(guild, channelName) {
    channelName = channelName.replace('-', '_');
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
    let adminIds = await Admin.getActiveAdmins(guild);
    let everyone_role = guild.roles.everyone;
    let bot_role = guild.roles.cache.find(r => r.name.toLowerCase() === 'rpg brawl bot');

    return {
        'staff': [
            {
                id: everyone_role.id,
                deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
            },
            {
                id: bot_role.id,
                allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
            },
            ...adminIds.map(admin => ({
                id: admin,
                allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
            }))
        ],
        'ta-standings': [
            {
                id: everyone_role.id,
                deny: [Permissions.FLAGS.SEND_MESSAGES]
            },
            {
                id: bot_role.id,
                allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
            },
            ...adminIds.map(admin => ({
                id: admin,
                allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
            }))
        ]
    };
}

function getHelpMessage(guild, category, channels) {
    return `🇬🇧\n` +
        `This is the bot category of the RPG Brawl. ` +
        `There are 2 channels: ${channels[2]} and ${channels[3]}.\n\n` +
        `In ${channels[2]}, there will be updates of the current TA standing. ` +
        `These are updated every 10 minutes, in the same way as the spreadsheet.\n\n` +
        `In ${channels[3]}, you can link your trackmania login to your discord name. ` +
        `If you do this, the ranking in ${channels[2]} will contain your discord nickname instead of your login.\n\n` +
        `If you have any questions or anything is unclear, you can ask questions here.\n\n` +
        `🇫🇷\n` +
        `Voici la catégorie bot du RPG Brawl.`  +
        `Il y a 2 channels: ${channels[2]} et ${channels[3]}.\n\n` +
        `Dans ${channels[2]}, il y aura les leaderboards TA actuels. `  +
        `Ils sont mis à jour toutes les 10 minutes, de la même manière que la spreadsheet.\n\n` +
        `Dans ${channels[3]}, vous pouvez lier votre login trackmania à votre pseudo discord. `  +
        `Si vous faites ceci, les leaderboards dans ${channels[2]} contiendront votre pseudo discord à la place de votre login.\n\n` +
        `Si vous avez des questions ou que quelque chose n'est pas clair, vous pouvez poser vos questions ici.\n\n`
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
