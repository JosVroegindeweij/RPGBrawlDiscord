const fs = require('fs');
const Logger = require('./logger');

let admins = require('../secrets/admins.json');

function execute(message) {
    if (!message.mentions.users.size && !message.mentions.roles.size) {
        return message.channel.send(`${message.author}, correct syntax: !admin [{role|user}...]`);
    }

    let guild = message.guild;
    admins[guild.id] = admins[guild.id] || [];

    message.mentions.users.forEach(user => {
        addAdmin(guild, user.id);
        message.reply(`Added user ${user} as admin`)
            .catch(reason => Logger.error(reason, guild));
    })

    message.mentions.roles.forEach(role => {
        addAdmin(guild, role.id);
        message.reply(`Added role ${role} as admin`)
            .catch(reason => Logger.error(reason, guild));
    })

    saveAdmins();
}

function addAdmin(guild, adminId) {
    admins[guild.id] = (admins[guild.id] || []).filter(id => id !== adminId).concat([adminId]);
    saveAdmins();
}

function saveAdmins(){
    fs.writeFileSync('secrets/admins.json', JSON.stringify(admins));
    Logger.info('Saved admins to JSON', guild);
}

function getAdmins(guild) {
    checkAdmins(guild);
    return admins[guild.id] || [];
}

function checkAdmins(guild) {
    admins[guild.id] = admins[guild.id].filter(mention =>
        guild.roles.cache.has(mention) || guild.members.cache.has(mention));
    saveAdmins();
}

function isAdmin(guildMember){
    let adminsInGuild = admins[guildMember.guild.id];
    if (!adminsInGuild) {
        return false;
    }
    for (id of adminsInGuild) {
        if (guildMember.id === id || guildMember.roles.cache.has(id)) {
            return true;
        }
    }
    return false;
}

module.exports = {
    name: 'admin',
    description: 'Gives admin permissions to a user or role.',
    execute,
    isAdmin,
    addAdmin,
    getAdmins,
    syntax: '!admin [{role|user}...]',
    channel: 'staff',
    admin: true
}