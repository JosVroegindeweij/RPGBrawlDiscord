const dbHandler = require('../utils/databaseHandler');
const Logger = require("../utils/logger");

function execute(message, args) {
    let guild = message.guild;
    let spreadsheet = args[0];
    let nameIndex = args.indexOf('-n');
    let rangeIndex = args.indexOf('-r');
    let loginRangeIndex = args.indexOf('-l');
    let avgRangeIndex = args.indexOf('-a');

    if (nameIndex >= 0 && rangeIndex >= 0) {
        dbHandler.addSpreadsheetRange(guild, spreadsheet, args[nameIndex + 1], args[rangeIndex + 1]);
    } else if (nameIndex === -1 && rangeIndex === -1){
        let loginRange = loginRangeIndex >= 0 ? args[loginRangeIndex + 1] : 'SR1!AC3:AC42';
        dbHandler.addSpreadsheetRange(guild, spreadsheet, 'login', loginRange);
        let avgRange = avgRangeIndex >= 0 ? args[avgRangeIndex + 1] : 'SR1!AA3:AA42';
        dbHandler.addSpreadsheetRange(guild, spreadsheet, 'avg', avgRange);
    } else {
        message.reply(`Command used wrongly`)
            .catch(reason => Logger.error(reason, message.guild));
        return;
    }
    message.reply(`Stored the new spreadsheet data`)
        .catch(reason => Logger.error(reason, message.guild));
}



module.exports = {
    name: 'spreadsheet',
    aliases: [],
    description: 'Links a new spreadsheet',
    execute,
    syntax: '{!spreadsheet id {-n name -r range | [-l loginRange] [-a avgsRange]}}',
    channel: 'staff',
    admin: true
};
