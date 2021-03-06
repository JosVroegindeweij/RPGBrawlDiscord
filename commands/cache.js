const dbHandler = require('../utils/databaseHandler');
const Logger = require('../utils/logger');

function execute(message) {
    dbHandler.getPlayerLink(message.guild)
        .then(links => message.guild.members.fetch(links.map(l => l.discord_id))
            .catch(reason => Logger.error(reason, message.guild)))
        .catch(reason => Logger.error(reason, message.guild));
}

module.exports = {
    name: 'cache',
    aliases: [],
    description: 'Adds all linked users to cache.',
    execute,
    syntax: '!cache',
    channel: 'staff',
    admin: true
};