const { Client, Intents } = require('discord.js');

const Logger = require('./utils/logger');
const cmdHandler = require('./utils/commandHandler');

const {token} = require('./secrets/config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS]});

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

