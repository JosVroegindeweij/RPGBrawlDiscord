module.exports = {
    name: 'stop_getqualified',
    aliases: ['stop_gq', 'stopgq', 'sgq'],
    description: 'Stops automatic updating of qualified list',
    execute: require('./getqualified').stop_scheduler,
    syntax: '{!stop_getqualified | !stop_gq | !stopgq | !sgq}',
    channel: 'ta-standings',
    admin: true
}