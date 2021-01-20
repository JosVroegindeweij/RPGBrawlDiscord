const mysql = require('mysql');
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
    knex('channel').insert({
        guild: guild,
        cat: category,
        staff: staff,
        ta_standings: ta_standings,
        linking:linking
    });
}

module.exports = {
    saveChannels
}