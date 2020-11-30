const fs = require('fs');

const { addAdmin, getAdmins } = require('./admin');
let channels = require('../secrets/channels.json');

function execute(message, args) {
    if (channels[message.guild.id] && !(args.includes('--force') || args.includes('-f'))) {
        message.reply(`This server already has a bot category.`)
            .catch(console.error);
        return;
    }

    let indexOfAdd = Math.max(args.indexOf('-add'), args.indexOf('-a'));
    if (indexOfAdd !== -1) {
        for (arg of args.slice(indexOfAdd + 1)) {
            if (arg?.id) {
                addAdmin(message.guild, arg.id);
            }
        }
    }

    let guild = message.guild;
    let channelManager = guild.channels;
    let everyone_role = guild.roles.everyone;
    let bot_role = guild.roles.cache.find(r => r.name.toLowerCase() === 'rpg brawl bot');
    let admins = getAdmins(guild);

    channels[guild.id] = channels[guild.id] || {};

    channelManager.create('RPG Brawl bot', {
        type: 'category'
    })
        .then(category => {
            // Add category to channels.json
            channels[guild.id]['category'] = category.id;
            channels[guild.id]['channels'] = {};
            console.log('Created Bot channel category.')
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
                            id: admin.id,
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
                            id: admin.id,
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
                .then(values => {
                    channels[guild.id]['channels']['staff'] = values[0].id;
                    console.log('Created staff channel.');
                    channels[guild.id]['channels']['ta-standings'] = values[1].id;
                    console.log('Created TA-standings channel.');
                    channels[guild.id]['channels']['linking'] = values[2].id;
                    console.log('Created linking channel.');
                })
                .catch(console.error)
                .finally(() => {
                    fs.writeFileSync('secrets/channels.json', JSON.stringify(channels));
                    console.log('Saved channels to JSON');
                });
        })
        .catch(console.error);
}

function findChannelId(guild, channelName) {
    return channels[guild.id]['channels'][channelName];
}

function buildTopic(commands, channelName) {
    let topic = ' -';
    for (cmd of commands) {
        if (cmd.channel === channelName) {
            topic += ' ' + cmd.syntax + ' -';
        }
    }
}

module.exports = {
    name: 'setup',
    description: 'Sets up the use of RPG Brawl bot on a server',
    execute,
    findChannelId,
    syntax: '!setup [{-f|--force}] [{-a|-add} {role|user}...]',
    channel: 'staff',
    admin: true
}