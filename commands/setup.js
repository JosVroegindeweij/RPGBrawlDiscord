const fs = require('fs');
const Logger = require('../utils/logger');

const { addAdmin, getAdmins } = require('./admin');
let channels = require('../secrets/channels.json');
const dbHandler = require("../utils/databaseHandler");

function execute(message, args) {
    if (channels[message.guild.id] && !(args.includes('--force') || args.includes('-f'))) {
        message.reply(`This server already has a bot category.`)
            .catch(reason => Logger.error(reason, message.guild));
        return;
    }

    if (dbHandler.existChannels(message.guild) && !(args.includes('--force') || args.includes('-f'))) {
        message.reply(`This server already has a bot category.`)
            .catch(reason => Logger.error(reason, message.guild));
        return;
    }

    let guild = message.guild;
    message.mentions.users.forEach(user => addAdmin(guild, user.id));
    message.mentions.roles.forEach(role => addAdmin(guild, role.id));

    let channelManager = guild.channels;
    let everyone_role = guild.roles.everyone;
    let bot_role = guild.roles.cache.find(r => r.name.toLowerCase() === 'rpg brawl bot');
    let admins = getAdmins(guild);

    channelManager.create('RPG Brawl bot', {
        type: 'category'
    })
        .then(category => {
            Logger.info('Created Bot channel category.', guild)
            Promise.all([
                channelManager.create('staff', {
                    topic: 'Staff commands' +
                        buildTopic(message.client.commands, 'staff'),
                    parent: category,
                    permissionOverwrites: [
                        {
                            id: everyone_role.id,
                            deny: ['VIEW_CHANNEL']
                        },
                        {
                            id: bot_role.id,
                            allow: ['VIEW_CHANNEL']
                        },
                        ...admins.map(admin => ({
                            id: admin,
                            allow: ['VIEW_CHANNEL']
                        }))
                    ]
                }),
                channelManager.create('ta-standings', {
                    topic: 'TA standings updates' +
                        buildTopic(message.client.commands, 'ta-standings'),
                    parent: category,
                    permissionOverwrites: [
                        {
                            id: everyone_role.id,
                            deny: ['SEND_MESSAGES']
                        },
                        {
                            id: bot_role.id,
                            allow: ['SEND_MESSAGES']
                        },
                        ...admins.map(admin => ({
                            id: admin,
                            allow: ['SEND_MESSAGES']
                        }))
                    ]
                }),
                channelManager.create('linking', {
                    topic: 'Linking trackmania logins with discord users' +
                        buildTopic(message.client.commands, 'linking'),
                    parent: category
                })
            ])
                .then(channels => {
                    Logger.info('Created bot channels.', guild);
                    dbHandler.saveChannels(
                        guild,
                        category,
                        channels[0],
                        channels[1],
                        channels[2]
                    );
                })
                .catch(reason => Logger.error(reason, message.guild))
                .finally(() => {

                });
        })
        .catch(reason => Logger.error(reason, message.guild));
}

function findChannelId(guild, channelName) {
    return channels[guild.id]['channels'][channelName];
}

function buildTopic(commands, channelName) {
    let topic = ' -';
    for (cmd of commands) {
        if (cmd[1].channel === channelName) {
            topic += ' ' + cmd[1].syntax + ' -';
        }
    }
    return topic;
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