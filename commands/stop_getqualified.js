const { stop_scheduler } = require('./getqualified')

module.exports = {
    name: 'stop_getqualified',
    aliases: ['stop_gq', 'stopgq', 'sgq'],
    description: 'Stops automatic updating of qualified list',
    execute: stop_scheduler,
    syntax: '!stop_getqualified'
}