const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token} = require('./secrets/config.json');
const fs = require('fs');
const { isAdmin } = require('./commands/admin');
const { findChannelId } = require('./commands/setup');

client.once('ready', () => {
    console.log('Bot launched!');
});


client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


commandFiles.forEach(
    file => {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
        console.log(`Command ${command.name} added`);
    }
);

client.login(token)
    .then(_ => console.log('Logged in'))
    .catch(console.error);

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot || !message.member) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    // Admin permission check
    let isGlobalAdmin = message.member.permissions.any('ADMINISTRATOR');
    if (command.admin && !(isGlobalAdmin || isAdmin(message.member))){
        message.reply(`Only admins can use this command!`)
            .catch(console.error);
        return;
    }

    // Channel permission check - can only occur after the setup command has been run,
    // so setup should be independent of this
    if (command.name !== 'setup') {
        let correctChannelId = findChannelId(message.guild, command.channel);
        let correctChannel = message.guild.channels.cache.get(correctChannelId);
        if (message.channel.id !== correctChannelId) {
            message.reply(`This command cannot be used in this channel. Use channel ${correctChannel} instead`)
                .catch(console.error);
            return;
        }
    }

    // Execute command
    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing the command. Check the console for more info')
            .catch(console.error);
    }
})