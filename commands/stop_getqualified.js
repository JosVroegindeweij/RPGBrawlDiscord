const get_qualified = require('./getqualified')

execute = get_qualified.stop_scheduler

module.exports = {
    name: 'stop_getqualified',
    aliases: ['stop_gq', 'stopgq', 'sgq'],
    description: 'Stops automatic updating of qualified list',
    execute,
    syntax: '!stop_getqualified'
}