const Discord = require('discord.js');

const Logger = require('./utils/logger');
const cmdHandler = require('./utils/commandHandler');

const {token} = require('./secrets/config.json');

const client = new Discord.Client({intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Discord.Intents.FLAGS.MESSAGE_CONTENT});

client.once('ready', () => {
    Logger.info('Bot launched!', 'main');
});

client.login(token)
    .then(_ => Logger.info('Logged in', 'main'))
    .catch(reason => Logger.error(reason, 'main'));

cmdHandler.initCommands(client);

client.on('messageCreate', cmdHandler.onMessage.bind(null, client));

process.on('unhandledRejection', error => {
    Logger.error('Unhandled promise rejection:' + error, 'main');
});

