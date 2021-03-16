const fs = require('fs');
const readline = require('readline');

const {google} = require('googleapis');

const Logger = require('./logger');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'secrets/token.json';


function call(func, args) {
    for (arg of args) {
        func = func.bind(null, arg);
    }
    fs.readFile('secrets/credentials.json', (err, content) => {
        if (err) return Logger.error('Error loading client secret file:' + err, 'SPREADSHEETS');
        // Authorize a client with credentials, then call the Google Sheets API.
        // authorize(JSON.parse(content), listMajors);
        authorize(JSON.parse(content), func);
    });
}

function getRange(spreadsheetId, range, callback, auth) {
    const sheets = google.sheets({version: 'v4', auth});
    sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range
    }, (err, res) => {
        if (err) {
            return Logger.error('The API returned an error: ' + err, 'SPREADSHEETS');
        }
        callback(res.data.values);
    });
}

function getBatch(spreadsheetId, ranges, callback, auth) {
    const sheets = google.sheets({version: 'v4', auth});
    sheets.spreadsheets.values.batchGet({
        spreadsheetId: spreadsheetId,
        majorDimension: 'COLUMNS',
        ranges: ranges
    }, (err, res) => {
        if (err) {
            return Logger.error('The API returned an error: ' + err, 'SPREADSHEETS');
        }
        callback(res.data.valueRanges);
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client); // Add other args
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    Logger.info('Authorize this app by visiting this url:' + authUrl, 'SPREADSHEETS');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err)
                return Logger.error('Error while trying to retrieve access token' + err, 'SPREADSHEETS');
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return Logger.error(err, 'SPREADSHEETS');
                Logger.info('Token stored to' + TOKEN_PATH, 'SPREADSHEETS');
            });
            callback(oAuth2Client);
        });
    });
}

module.exports = {
    call,
    getRange,
    getBatch
}