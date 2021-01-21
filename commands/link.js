const fs = require('fs');
const Logger = require('../utils/logger');

let links = require('../secrets/player_discord_links.json')

function execute(message, args) {
    if (!args.length || args.length > 2) {
        return message.channel.send(`${message.author}, correct syntax: !link login [mention]`);
    }

    let login = args[0];
    let discord_user_id = message.author.id;
    if (args.length === 2) {
        if (!message.member.roles.cache.find(r => r.name.toLowerCase() === 'linker')) {
            message.reply(`You don't have permissions to link other players!`)
                .catch(reason => Logger.error(reason, guild));
            return;
        }
        let id = getIdFromMention(args[1]);
        if (id) {
            discord_user_id = id;
        } else {
            message.reply('You entered a second argument, but it is not a mention. Please try again!')
                .catch(reason => Logger.error(reason, guild));
            return;
        }
    }
    links[login] = discord_user_id;

    save_links();

    let linked_role = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'linked');
    let user = message.guild.members.cache.get(discord_user_id);

    if (!linked_role) {
        message.guild.roles.create({
            data: {
                name: 'linked',
                color: 'DEFAULT',
                permissions: 0,
            }
        })
            .then(role => {
                add_user_to_role(message, args[0], user, role);
                Logger.info(`Linked login '${login}' to 
                discord username '${user.username}#${user.tag}'`, guild);
            })
            .catch(reason => Logger.error(reason, guild));
    } else {
        add_user_to_role(message, args[0], user, linked_role);
    }

}

function add_user_to_role(message, login, user, role) {
    user.roles.add(role)
        .then(_ => {
            message.reply(`Linked login '${login}' with user ${user}`).catch(console.error)
        }).catch(console.error)
}

function get_discord_id_by_login(login) {
    return links[login];
}

function unlink(message, args) {
    if (!message.member.roles.cache.find(r => r.name.toLowerCase() === 'linker')){
        message.reply(`Please let someone with permissions look at this, - ${message.guild.roles.cache.find(
            role => role.name === 'linker'
        )} -`)
            .catch(reason => Logger.error(reason, guild));
        return;
    }

    if (!args.length) {
        message.reply(`You forgot to add a login to unlink!`)
            .catch(reason => Logger.error(reason, guild));
        return;

    }
    delete links[args[0]];
    message.reply(`Unlinked login '${args[0]}'`)
        .catch(reason => Logger.error(reason, guild));
    Logger.info(`Unlinked login '${args[0]}'`, guild);
    save_links();
}

function save_links() {
    fs.writeFileSync('secrets/player_discord_links.json', JSON.stringify(links));
    Logger.info('Saved links to JSON', guild);
}

function getIdFromMention(mention) {
    const matches = mention.match(/^<@!?(\d+)>$/);
    if (!matches) return;
    return matches[1];
}

module.exports = {
    name: 'link',
    aliases: [],
    description: 'Links a trackmania login to a discord user.',
    execute,
    unlink,
    get_discord_id_by_login,
    syntax: '!link login [{role|user}]',
    channel: 'linking',
    admin: false
};