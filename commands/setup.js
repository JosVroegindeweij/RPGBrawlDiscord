

function execute(message, args) {
    if (!message.member.roles.cache.find(r => r.name.toLowerCase() === 'staff')){
        message.reply(`Only staff members can use this command!`);
        return;
    }

    let guild = message.guild;
    let channelManager = guild.channels;
    let admin_role = guild.roles.cache.find(r => r.name.toLowerCase() === 'staff');
    let everyone_role = guild.roles.everyone;
    let bot_role = guild.roles.cache.find(r => r.name.toLowerCase() === 'rpg brawl bot');


    channelManager.create('RPG Brawl bot', {
        type: 'category',
    })
        .then(category => {
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
            }).catch(console.error);

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
            }).catch(console.error);

            channelManager.create('linking', {
                topic: 'Linking trackmania logins with discord users - !link login [mention] - !unlink login',
                parent: category
            }).catch(console.error);
        })
        .catch(console.error);


}


module.exports = {
    name: 'setup',
    description: 'Sets up the use of RPG Brawl bot on a server',
    execute,
    syntax: '!setup'
}