const Logger = require('./logger');

const {db_host, db_username, db_password, db_name} = require('../secrets/config.json');

const knex = require('knex')({
    client: 'pg',
    connection: {
        host: db_host,
        user: db_username,
        password: db_password,
        database: db_name
    },
    debug: false,
    asyncStackTraces: true
});

function saveChannels(guild, category, help, staff, ta_standings, linking) {
    knex('channel')
        .insert({
            guild: guild.id,
            category: category.id,
            help: help.id,
            staff: staff.id,
            ta_standings: ta_standings.id,
            linking: linking.id
        })
        .onConflict('guild')
        .merge()
        .then(_ => Logger.info('Saved (updated) channels to database', guild))
        .catch(reason => Logger.error(reason, guild));
}

async function getChannels(guild) {
    return (await knex('channel')
        .where('guild', guild.id))[0];
}

function addAdmin(guild, type, admin) {
    knex('admin')
        .insert({
            'guild': guild.id,
            'type': type,
            'admin': admin.id
        })
        .onConflict(['guild', 'admin'])
        .ignore()
        .then(_ => Logger.info(`Added ${type} ${admin?.displayName ?? admin.name} as admin to database`, guild))
        .catch(reason => Logger.error(reason, guild));
}

function getAdmins(guild) {
    return knex('admin')
        .where('guild', guild.id)
        .select(['type', 'admin']);
}

function addPlayerLink(guild, login, member) {
    knex('player')
        .insert({
            'guild': guild.id,
            'login': login,
            'discord_id': member.id
        })
        .onConflict(['guild', 'login'])
        .merge()
        .then(_ => Logger.info(`Linked login '${login}' ` +
        `to discord user ${member.user.username}#${member.user.tag}`, guild))
        .catch(reason => Logger.error(reason, guild));
}

function getPlayerLink(guild, columns) {
    if (columns.login) {
        return knex('player')
            .where({
                'guild': guild.id,
                'login': columns.login
            });
    } else {
        return knex('player')
            .where({
                'guild': guild.id,
                'discord_id': columns.id
            });
    }
}

function removePlayerLink(guild, columns) {
    return getPlayerLink(guild, columns).del();
}

function addSpreadsheetRange(guild, spreadsheet, name, range) {
    knex('spreadsheet')
        .insert({
            'guild': guild.id,
            'spreadsheet': spreadsheet,
            'name': name,
            'range': range
        })
        .onConflict(['guild', 'name'])
        .merge()
        .then(_ => Logger.info(`Stored spreadsheet ` +
            `'${spreadsheet}', name: '${name}', range: '${range}' to database.`, guild))
        .catch(reason => Logger.error(reason, guild));
}

function getSpreadsheetRange(guild, name) {
    return knex('spreadsheet')
        .where({
            'guild': guild.id,
            'name': name
        });
}

module.exports = {
    saveChannels,
    getChannels,
    addAdmin,
    getAdmins,
    addPlayerLink,
    getPlayerLink,
    removePlayerLink,
    addSpreadsheetRange,
    getSpreadsheetRange
}
