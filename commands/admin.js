const fs = require('fs');

let admins = require('../secrets/admins.json');

function execute(message) {
    if (!message.mentions.users.size && !message.mentions.roles.size) {
        return message.channel.send(`${message.author}, correct syntax: !admin [{role|user}...]`);
    }

    let guild = message.guild;
    admins[guild.id] = admins[guild.id] || [];

    message.mentions.users.forEach(user => {
        admins[guild.id] = admins[guild.id].filter(id => id !== user.id).concat([user.id]);
        message.reply(`Added user ${user} as admin`).catch(console.error);
    })

    message.mentions.roles.forEach(role => {
        admins[guild.id] = admins[guild.id].filter(id => id !== role.id).concat([role.id]);
        message.reply(`Added role ${role} as admin`).catch(console.error);
    })

    save_admins();
}

function save_admins(){
    fs.writeFileSync('secrets/admins.json', JSON.stringify(admins));
    console.log('Saved admins to JSON');
}


module.exports = {
    name: 'admin',
    description: 'Gives admin permissions to a user or role.',
    execute,
    syntax: '!admin [{role|user}...]',
    channel: 'staff'
}