module.exports = {
    name: 'addmatch',
    aliases: ['am', 'add'],
    description: 'Adds a new match, creates channel for the match.',
    execute(message) {
        if (!message.member.roles.cache.find(r => r.name.toLowerCase() === 'staff')){
            message.reply(`Only staff members can use this command!`)
                .catch(console.error);
            return;
        }
        message.channel.send('Hello world')
    },
    syntax: '!addmatch ',
    channel: 'staff'
};