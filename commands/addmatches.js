function execute(message) {

}



module.exports = {
    name: 'addmatches',
    aliases: ['am', 'matches'],
    description: 'Adds a new match, creates channel for the match.',
    execute,
    syntax: '{!addmatches | !am | !matches}',
    channel: 'staff',
    admin: true
};