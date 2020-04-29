const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const {db} = require('../util/admin')
const content = require('../token.json')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://mail.google.com/'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), null);
});

let oAuth2Client

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.web;
    oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        //oAuth2Client.setCredentials(JSON.parse(token));
        oAuth2Client.setCredentials({
            refresh_token: content.refresh_token,
            access_token: content.access_token
        });
        //callback(oAuth2Client);
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
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            //callback(oAuth2Client);
        });
    });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

/*
function listLabels(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    gmail.users.labels.list({
        userId: 'me',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const labels = res.data.labels;
        if (labels.length) {
            console.log('Labels:');
            labels.forEach((label) => {
                console.log(`- ${label.name}`);
            });
        } else {
            console.log('No labels found.');
        }
    });
}
*/


async function sendMail(auth, to, from, subject, message) {
    const gmail = google.gmail({version: 'v1', auth})

    function makeBody() {
        const str = [
            "Content-Type: text/plain; charset=\"UTF-8\"\n",
            "MIME-Version: 1.0\n",
            "Content-Transfer-Encoding: 7bit\n",
            "to: ", to, "\n",
            "from: ", from, "\n",
            "subject: ", subject, "\n\n",
            message
        ].join('')

        const encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_')
        return encodedMail
    }

    let encodedMessage = makeBody()

    await gmail.users.messages.send({
        auth,
        userId: 'me',
        resource: {
            raw: encodedMessage
        }
    })

}

function listMessages(userId, query, callback) {
    const gmail = google.gmail({version: 'v1', oAuth2Client})
    let getPageOfMessages = function (request, result) {
        request.execute((resp) => {
            result = result.concat(resp.messages)
            let nextPageToken = resp.nextPageToken
            if (nextPageToken) {
                request = gmail.users.messages.list({
                    'userId': 'me',
                    'pageToken': nextPageToken,
                    'q': query
                })
                getPageOfMessages(request, res)
            } else {
                return callback(res)
            }
        })
    }
    var initialRequest = gmail.users.messages.list({
        'userId': 'me',
        'q': query
    })
    getPageOfMessages(initialRequest, [])
}

exports.sendMail = async (req, res) => {

    try {

        const emailDetails = {
            to: req.body.to,
            from: req.user.email,
            subject: req.body.subject,
            message: req.body.message
        }

        await sendMail(oAuth2Client, emailDetails.to, emailDetails.from, emailDetails.subject, emailDetails.message)
        return res.status(200).json({message: "Email has been send"})

    } catch (err) {
        if (err.code === "auth/id-token-expired")
            return res.status(401).json({general: 'Login expired, please login again'});
        else
            return res.status(500).json({error: err.code})
    }
}

exports.addSpammer = async (req, res) => {

    let spamData = []

    try {
        const data = await db.collection('spammedEmails').where('username', '==', req.user.username).get()

        if (data.empty) {
            return res.status(404).json({error: 'No spammed email addresses found'})
        } else {
            data.forEach(doc => {
                // Add to spamData array
                spamData.push({
                    spammedEmail: doc.data().spammedEmail
                })
            })
        }

        return res.json(spamData)
    } catch (err) {
        if (err.code === "auth/id-token-expired")
            return res.status(401).json({general: 'Login expired, please login again'});
        else
            return res.status(500).json({error: err.code})
    }

    /*    const gmail = google.gmail({version: 'v1', oAuth2Client})
        let getPageOfMessages = function (request, result) {
            request.execute((resp) => {
                result = result.concat(resp.messages)
                let nextPageToken = resp.nextPageToken
                if (nextPageToken){
                    request = gmail.users.messages.list({
                        'userId': 'me',
                        'pageToken': nextPageToken,
                        'q': query
                    })
                    getPageOfMessages(request, res)
                } else {
                    return callback(res)
                }
            })
        }
        var initialRequest = gmail.users.messages.list({
            'userId': 'me',
            'q': query
        })
        getPageOfMessages(initialRequest, [])*/

    /*let spamData = []

    try {
        const data = await db.collection('spammedEmails').where('username', '==', req.user.username).get()

        if (data.empty) {
            return res.status(404).json({error: 'No spammed email addresses found'})
        } else {
            data.forEach(doc => {
                // Add to spamData array
                spamData.push({
                    spammedEmail: doc.data().spammedEmail
                })

                async function getEmail() {
                    try {
                        return await gmail.users.messages.list(q=`from:${doc.data().spammedEmail}`)
                    } catch (err) {
                        console.log(err)
                    }
                }

                getEmail()
            })
        }

        //return res.json(spamData)
    } catch (err) {
        console.log(err)
        return res.status(500).json({error: err.code})
    }*/

}

exports.getMessages = async (req, res) => {
    // https://github.com/googleapis/google-api-nodejs-client/issues/1523
    const gmail = google.gmail({version: 'v1', auth: oAuth2Client})

    try {
        const messages = await gmail.users.messages.list({
            oAuth2Client,
            userId: 'me',
            q: 'from:9001603@student.tcrmbo.nl'
        })

        return res.json(messages.data.messages)
    } catch (err) {
        if (err.code === "auth/id-token-expired")
            return res.status(401).json({general: 'Login expired, please login again'});
        else
            return res.status(500).json({error: err.code})
    }
}
