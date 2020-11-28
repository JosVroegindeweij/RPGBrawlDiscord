const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token} = require('./secrets/config.json');
const fs = require('fs');

client.once('ready', () => {
    console.log('Bot launched!');
});


client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


commandFiles.forEach(
    file => {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
    }
);

client.login(token)
    .then(_ => console.log('Logged in'))
    .catch(console.error);

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing the command. Check the console for more info')
            .catch(console.error);
    }
})