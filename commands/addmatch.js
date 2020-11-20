module.exports = {
    name: 'ping',
    desciption: 'Pingpong',
    execute(message) {
        message.channel.send('Pong!')
    }
};