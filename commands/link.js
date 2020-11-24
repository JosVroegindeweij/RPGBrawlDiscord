const fs = require('fs');

let links = require('../player_discord_links.json')

function execute(message, args) {
    if (!args.length || args.length > 2) {
        return message.channel.send(`${message.author}, correct syntax: !link login [mention]`);
    }

    let login = args[0];
    let discord_user_id = message.author.id;
    if (args.length === 2) {
        if (!message.member) {
            message.reply(`You can't link other players in DM`);
            return;
        }
        if (!message.member.roles.cache.find(r => r.name.toLowerCase() === 'linker')){
            message.reply(`You don't have permissions to link other players!`);
            return;
        }
        let id = getIdFromMention(args[1]);
        if (id){
            discord_user_id = id;
        } else {
            message.reply('You entered a second argument, but it is not a mention. Please try again!');
            return;
        }
    }
    links[login] = discord_user_id;

    save_links();

    message.reply(`Linked login '${args[0]}' with user ${message.author}`);
}

function unlink(message, args) {
    if (!message.member) {
        message.reply(`You can't unlink other players in DM`);
        return;
    }
    if (!message.member.roles.cache.find(r => r.name.toLowerCase() === 'linker')){
        message.reply(`Please let someone with permissions look at this, - ${message.guild.roles.cache.find(
            role => role.name === 'linker'
        )} -`);
        return;
    }

    if (!args.length) {
        message.reply(`You forgot to add a login to unlink!`);
        return;

    }
    delete links[args[0]];
    message.reply(`Unlinked login '${args[0]}'`);
    save_links();
}

function save_links() {
    fs.writeFileSync('player_discord_links.json', JSON.stringify(links));
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
    syntax: '!link login [mention]'
};