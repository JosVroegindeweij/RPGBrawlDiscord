const { Client, Intents } = require('discord.js');

const Logger = require('./utils/logger');
const cmdHandler = require('./utils/commandHandler');

const {token} = require('./secrets/config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.MESSAGE_CONTENT]});

client.once('ready', () => {
    info('Bot launched!', 'main');
});

client.login(token)
    .then(_ => info('Logged in', 'main'))
    .catch(reason => _error(reason, 'main'));

initCommands(client);

client.on('messageCreate', onMessage.bind(null, client));

process.on('unhandledRejection', error => {
    _error('Unhandled promise rejection:' + error, 'main');
});

