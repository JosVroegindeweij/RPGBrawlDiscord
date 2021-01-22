const fs = require('fs');
const Logger = require('../utils/logger');

module.exports = {
    name: 'reload',
    description: 'Reloads all commands',
    execute(message) {
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        commandFiles.forEach(
            file => {
                delete require.cache[require.resolve(`./${file}`)];
                const command = require(`./${file}`);
                message.client.commands.set(command.name, command);
            }
        );
        message.reply('Reloaded all commands!')
            .catch(reason => Logger.error(reason, message.guild));
        Logger.info('Reloaded all commands', message.guild);
    },
    syntax: '!reload',
    channel: 'staff',
    admin: true
}