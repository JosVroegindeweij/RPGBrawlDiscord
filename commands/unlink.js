const { unlink } = require('./link.js');

module.exports = {
    name: 'unlink',
    aliases: [],
    description: 'Unlink a previously linked login from a discord user',
    execute: unlink,
    syntax: '!unlink login',
    channel: 'linking'
}