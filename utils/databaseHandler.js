const Logger = require('./logger');

const { db_host, db_username, db_password, db_name } = require('../secrets/config.json');
const knex = require('knex')({
    client: 'mysql',
    version: '5.7',
    connection: {
        host: db_host,
        user: db_username,
        password: db_password,
        database: db_name
    },
    debug: true,
    asyncStackTraces: true
});

function saveChannels(guild, category, staff, ta_standings, linking){
    Logger.info('Saving channels to database', guild);
    knex('channel').insert({
        guild: guild.id,
        category: category.id,
        staff: staff.id,
        ta_standings: ta_standings.id,
        linking: linking.id
    })
        .then(Logger.info('Saved channels to database', guild))
        .catch(reason => Logger.error(reason, guild));
}

function existChannels(guild) {
    Logger.info('Grabbing existing channel information from the database', guild);
}

module.exports = {
    saveChannels,
    existChannels
}