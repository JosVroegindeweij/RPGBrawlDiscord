const Discord = require('discord.js');

const Logger = require('./utils/logger');
const cmdHandler = require('./utils/commandHandler');

const {token} = require('./secrets/config.json');

const client = new Discord.Client();

client.once('ready', () => {
    Logger.info('Bot launched!', 'MAIN');
});

client.login(token)
    .then(_ => Logger.info('Logged in', 'MAIN'))
    .catch(reason => Logger.error(reason, 'MAIN'));

cmdHandler.initCommands(client);

client.on('message', cmdHandler.onMessage.bind(null, client));