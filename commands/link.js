const Logger = require('../utils/logger');
const dbHandler = require('../utils/databaseHandler');

async function execute(message, args) {
    if (!args.length || args.length > 2) {
        return message.channel.send(`${message.author}, correct syntax: !link login [mention]`);
    }

    let login = args[0];
    let member = message.member;
    if (args.length === 2) {
        if (!message.member.roles.cache.find(r => r.name.toLowerCase() === 'linker')) {
            message.reply(`You don't have permissions to link other players!`)
                .catch(reason => Logger.error(reason, message.guild));
            return;
        }
        if (message.mentions.members.size) {
            member = message.mentions.members.first();
        } else {
            message.reply('You entered a second argument, but it is not a mention. Please try again!')
                .catch(reason => Logger.error(reason, message.guild));
            return;
        }
    }
    dbHandler.addPlayerLink(message.guild, login, member);

    let linkedRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'linked');

    if (!linkedRole) {
        message.guild.roles.create({
            name: 'linked',
            color: 'DEFAULT',
            permissions: 0n
        })
            .then(role => {
                addUserToRole(message, login, member, role);
            })
            .catch(reason => Logger.error(reason, message.guild));
    } else {
        addUserToRole(message, login, member, linkedRole);
    }
    message.reply(`Login '${login}' is linked to user ${member}`)
        .catch(reason => Logger.error(reason, message.guild));
}

function addUserToRole(message, login, member, role) {
    member.roles.add(role)
        .catch(reason => Logger.error(reason, message.guild));
}

function unlink(message, args) {
    if (!message.member.roles.cache.find(r => r.name.toLowerCase() === 'linker')) {
        message.reply(`Please let someone with permissions look at this, - ${message.guild.roles.cache.find(
            role => role.name === 'linker'
        )} -`)
            .catch(reason => Logger.error(reason, message.guild));
        return;
    }

    if (!args.length) {
        message.reply(`You forgot to add a login/mention to unlink!`)
            .catch(reason => Logger.error(reason, message.guild));
        return;
    }

    if (message.mentions.members.size) {
        let member = message.mentions.members.first();
        dbHandler.removePlayerLink(message.guild, {id: member.id})
            .then(rows => {
                if (rows === 0) {
                    message.reply(`This user was not linked`)
                        .catch(reason => Logger.error(reason, message.guild));
                    Logger.info(`Tried to unlink non-linked user '${member.user.username}#${member.user.tag}'`,
                        message.guild);
                } else {
                    message.reply(`Unlinked user ${member}`)
                        .catch(reason => Logger.error(reason, message.guild));
                    Logger.info(`Unlinked user '${member.user.username}#${member.user.tag}'`, message.guild);
                }
            })
            .catch(reason => Logger.error(reason, message.guild));
    } else {
        let login = args[0]
        dbHandler.removePlayerLink(message.guild, {login: login})
            .then(rows => {
                if (rows === 0) {
                    message.reply(`This login was not linked`)
                        .catch(reason => Logger.error(reason, message.guild));
                    Logger.info(`Tried to unlink non-linked login '${login}'`);
                } else {
                    message.reply(`Unlinked login ${login}`)
                        .catch(reason => Logger.error(reason, message.guild));
                    Logger.info(`Unlinked login '${login}'`);
                }
            })
            .catch(reason => Logger.error(reason, message.guild));
    }
}

module.exports = {
    name: 'link',
    aliases: [],
    description: 'Links a trackmania login to a discord user.',
    execute,
    unlink,
    syntax: '!link login [{role|user}]',
    channel: 'linking',
    admin: false
};