const Discord = require('discord.js');
const client = new Discord.Client();
const {token} = require('./secrets/config.json');

const { initCommands, onMessage } = require('./utils/commandHandler');

client.once('ready', () => {
    console.log('Bot launched!');
});

client.login(token)
    .then(_ => console.log('Logged in'))
    .catch(console.error);

initCommands(client);

client.on('message', onMessage.bind(null, client));