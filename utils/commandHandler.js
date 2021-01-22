const fs = require('fs');

const Discord = require('discord.js');

const Logger = require('./logger');

const Admin = require('../commands/admin');
const Setup = require('../commands/setup');

const { prefix } = require('../secrets/config.json');

function initCommands(client) {
    client.commands = new Discord.Collection();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    commandFiles.forEach(
        file => {
            const command = require(`../commands/${file}`);
            client.commands.set(command.name, command);
            Logger.info(`Command ${command.name} added`, 'MAIN');
        }
    );
}

function onMessage(client, message) {
    if (!message.content.startsWith(prefix) || message.author.bot || !message.member) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    // Admin permission check
    let isGlobalAdmin = message.member.permissions.any('ADMINISTRATOR');
    if (command.admin && !(isGlobalAdmin || Admin.isAdmin(message.member))){
        message.reply(`Only admins can use this command!`)
            .catch(reason => Logger.error(reason, message.guild));
        return;
    }

    // Channel permission check - can only occur after the setup command has been run,
    // so setup should be independent of this
    if (command.name !== 'setup') {
        let correctChannelId = Setup.findChannelId(message.guild, command.channel);
        let correctChannel = message.guild.channels.cache.get(correctChannelId);
        if (message.channel.id !== correctChannelId) {
            message.reply(`This command cannot be used in this channel. Use channel ${correctChannel} instead`)
                .catch(reason => Logger.error(reason, message.guild));
            return;
        }
    }

    // Execute command
    try {
        command.execute(message, args);
    } catch (error) {
        Logger.error(error, message.guild);
        message.reply('There was an error executing the command. Check the logs for more info')
            .catch(reason => Logger.error(reason, message.guild));
    }
}

module.exports = {
    initCommands,
    onMessage
}