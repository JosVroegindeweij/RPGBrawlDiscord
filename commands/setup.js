const fs = require('fs');

let channels = require('../secrets/channels.json');

function execute(message) {let guild = message.guild;
    let channelManager = guild.channels;
    let admin_role = guild.roles.cache.find(r => r.name.toLowerCase() === 'staff');
    let everyone_role = guild.roles.everyone;
    let bot_role = guild.roles.cache.find(r => r.name.toLowerCase() === 'rpg brawl bot');
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
                    topic: 'Staff commands - !reload - !addmatch',
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
                        {
                            id: admin_role.id,
                            allow: ['VIEW_CHANNEL']
                        }
                    ]
                }),
                channelManager.create('ta-standings', {
                    topic: 'TA standings updates - !gq - !sgq',
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
                        {
                            id: admin_role.id,
                            allow: ['SEND_MESSAGES']
                        }
                    ]
                }),
                channelManager.create('linking', {
                    topic: 'Linking trackmania logins with discord users - !link login [mention] - !unlink login',
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

module.exports = {
    name: 'setup',
    description: 'Sets up the use of RPG Brawl bot on a server',
    execute,
    findChannelId,
    syntax: '!setup',
    channel: 'staff'
}