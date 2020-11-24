const fs = require('fs');

module.exports = {
    name: 'reload',
    description: 'Reloads all commands',
    execute(message, args) {
        message.reply('Reloading all commands!')
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        commandFiles.forEach(
            file => {
                delete require.cache[require.resolve(`./${file}`)];
                const command = require(`./${file}`);
                message.client.commands.set(command.name, command);
            }
        );
    },
    syntax: '!reload'
}