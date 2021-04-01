const Discord = require('discord.js');

const Logger = require('./utils/logger');
const cmdHandler = require('./utils/commandHandler');

const {token} = require('./secrets/config.json');

const client = new Discord.Client();

client.once('ready', () => {
    Logger.info('Bot launched!', 'main');
});

client.login(token)
    .then(_ => Logger.info('Logged in', 'main'))
    .catch(reason => Logger.error(reason, 'main'));

cmdHandler.initCommands(client);

client.on('message', cmdHandler.onMessage.bind(null, client));

process.on('unhandledRejection', error => {
    Logger.error('Unhandled promise rejection:' + error, 'main');
});

