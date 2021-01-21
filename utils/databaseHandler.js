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
    console.log('Saving channels to database');
    knex('channel').insert({
        guild: guild,
        category: category,
        staff: staff,
        ta_standings: ta_standings,
        linking: linking
    });
    console.log('Saved channels to database');
}

module.exports = {
    saveChannels
}