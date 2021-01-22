module.exports = {
    name: 'unlink',
    aliases: [],
    description: 'Unlink a previously linked login from a discord user',
    execute: require('./link.js').unlink,
    syntax: '!unlink login',
    channel: 'linking',
    admin: true
}