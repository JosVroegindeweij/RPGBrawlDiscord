const fs = require('fs');

module.exports = {
    name: 'reload',
    description: 'Reloads all commands',
    execute(message, args) {
        if (!message.member.roles.cache.find(r => r.name.toLowerCase() === 'staff')){
            message.reply(`Only staff members can use this command!`).catch(console.error);
            return;
        }
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        commandFiles.forEach(
            file => {
                delete require.cache[require.resolve(`./${file}`)];
                const command = require(`./${file}`);
                message.client.commands.set(command.name, command);
            }
        );
        message.reply('Reloaded all commands!').catch(console.error);
        console.log('Reloaded all commands');
    },
    syntax: '!reload'
}