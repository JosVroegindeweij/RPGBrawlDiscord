module.exports = {
    name: 'addmatch',
    aliases: ['am', 'add'],
    description: 'Adds a new match, creates channel for the match.',
    execute(message) {
        message.channel.send('Hello world')
    },
    syntax: '!addmatch '
};