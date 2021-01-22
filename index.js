const Discord = require('discord.js');
const client = new Discord.Client();
const {token} = require('./secrets/config.json');
const Logger = require('./utils/logger');

const { initCommands, onMessage } = require('./utils/commandHandler');

client.once('ready', () => {
    Logger.info('Bot launched!', 'MAIN');
});

client.login(token)
    .then(_ => Logger.info('Logged in', 'MAIN'))
    .catch(reason => Logger.error(reason, 'MAIN'));

initCommands(client);

client.on('message', onMessage.bind(null, client));