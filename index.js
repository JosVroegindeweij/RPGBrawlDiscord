const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

client.on('message', message => {
    if (message.content === '!message')
    message.channel.send('Here you go!');
});

client.login(config.token);