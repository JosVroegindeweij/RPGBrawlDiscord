const Logger = require('../utils/logger');
const dbHandler = require('../utils/databaseHandler');

function execute(message) {
    if (!message.mentions.members.size && !message.mentions.roles.size) {
        return message.channel.send(`${message.author}, correct syntax: !admin [{role|user}...]`);
    }

    let guild = message.guild;
    addAdmins(message);

    dbHandler.getChannels(guild)
        .then(channels => {
            let staff = guild.channels.cache.get(channels['staff']);
            let ta = guild.channels.cache.get(channels['ta_standings']);
            message.mentions.users.forEach(user => {
                staff?.updateOverwrite(user, {
                    'VIEW_CHANNEL': true,
                    'SEND_MESSAGES': true
                });
                ta?.updateOverwrite(user, {
                    'SEND_MESSAGES': true
                })
            });
            message.mentions.roles.forEach(role => {
                staff?.updateOverwrite(role, {
                    'VIEW_CHANNEL': true,
                    'SEND_MESSAGES': true
                });
                ta?.updateOverwrite(role, {
                    'SEND_MESSAGES': true
                });
            });
        });
}

function addAdmins(message) {
    message.mentions.members.forEach(member => {
        dbHandler.addAdmin(message.guild, 'user', member);
        message.reply(`Added user ${member} as admin`)
            .catch(reason => Logger.error(reason, message.guild));
    });

    message.mentions.roles.forEach(role => {
        dbHandler.addAdmin(message.guild, 'role', role);
        message.reply(`Added role ${role} as admin`)
            .catch(reason => Logger.error(reason, message.guild));
    });
}

async function isAdmin(guildMember) {
    return (await dbHandler.getAdmins(guildMember.guild)
        .then(admins => admins.includes(guildMember.id))
        .catch(reason => Logger.error(reason, guildMember.guild)));
}

async function getActiveAdmins(guild) {
    let adminIds = (await dbHandler.getAdmins(guild)).map(adm => adm.admin);
    // Fetch all admins to make sure they are in cache
    const adminUsersInGuild = [...(await guild.members.fetch({user: adminIds}))?.values()] ?? [];
    const adminRolesInGuild = [...(await guild.roles.fetch({user: adminIds}))?.values()] ?? [];

    // Remove admins that left the guild
    let activeAdmins = adminUsersInGuild
        .concat(adminRolesInGuild)
        .map(a => a.id);
    return adminIds.filter(admin => activeAdmins.includes(admin));
}

module.exports = {
    name: 'admin',
    description: 'Gives admin permissions to a user or role.',
    execute,
    isAdmin,
    addAdmins,
    getActiveAdmins,
    syntax: '!admin [{role|user}...]',
    channel: 'staff',
    admin: true
}
