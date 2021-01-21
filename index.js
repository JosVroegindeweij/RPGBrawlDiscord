const Discord = require('discord.js');
const client = new Discord.Client();
const {token} = require('./secrets/config.json');
const Logger = require('./utils/logger');

const { initCommands, onMessage } = require('./utils/commandHandler');

client.once('ready', () => {
    Logger.info('Bot launched!');
});

client.login(token)
    .then(_ => Logger.info('Logged in'))
    .catch(reason => Logger.error(reason));

initCommands(client);

client.on('message', onMessage.bind(null, client));