const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

const Logger = require('./logger');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const CREDENTIALS_PATH = path.join(process.cwd(), 'secrets/credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'secrets/token.json');

async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        Logger.info('Error loading token file:' + err, 'SPREADSHEETS');
        return null;
    }
}

async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}


function call(func, args) {
    for (arg of args) {
        func = func.bind(null, arg);
    }

    loadSavedCredentialsIfExist()
        .then((cred) => {
            Logger.info('Loaded credentials: ' + cred, 'SPREADSHEET');
            authorize(cred, func);
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

async function authorize(cred, func) {
    let client = cred;
    if (client) {
        Logger.info('client exists', 'SPREADSHEETS');
        return client;
    }
    Logger.info('authenticating', 'SPREADSHEETS');
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    Logger.info('authenticated' + client);
    if (client.credentials) {
        Logger.info('Saving credentials', 'SPREADSHEETS');
        await saveCredentials(client);
    }
    Logger.info('calling actual function', 'SPREADSHEETS');
    func();
}

module.exports = {
    call,
    getRange,
    getBatch
}
