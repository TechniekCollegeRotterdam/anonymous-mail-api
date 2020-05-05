const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const open = require('open')
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

async function addSpammer(auth, emailAddress) {
    // https://github.com/googleapis/google-api-nodejs-client/issues/1523
    const gmail = google.gmail({version: 'v1', auth})

    try {

        async function spammer(messageId) {
            await gmail.user.messages.modify({
                auth,
                userId: 'me',
                id: messageId,
                removeLabelIds: [
                    "INBOX"
                ],
                addLabelIds: [
                    "SPAM"
                ]
            })
        }

        const messages = await gmail.user.messages.list({
            auth,
            userId: 'me',
            q: `from:${emailAddress}`
        })

        messages.data.messages.forEach(message => spammer(message.id))

    } catch (err) {
        console.log(err)
    }
}

exports.addSpammer = async (req, res) => {

    try {
        const data = await db.collection('spammedEmails').where('username', '==', req.user.username).get()

        if (data.empty) {
            return res.status(404).json({error: 'No spammed email addresses found'})
        } else {
            data.map(async (doc) => {
                await addSpammer(oAuth2Client, doc.data().spammedEmail)
            })
        }

        return res.status(200).json('Spammer added')
    } catch (err) {
        if (err.code === "auth/id-token-expired")
            return res.status(401).json({general: 'Login expired, please login again'});
        else
            return res.status(500).json({error: err.code})
    }

    /*let spamEmails = []
    let spamData = {
        givenEmails : {}
    }
    let messages

    try {
        const data = await db.collection('spammedEmails').where('username', '==', req.user.username).get()

        if (data.empty) {
            return res.status(404).json({error: 'No spammed email addresses found'})
        } else {
            data.forEach((doc) => {
                // Add to spamData array
                spamEmails.push({
                    spammedEmail: doc.data().spammedEmail
                })

                // Convert array to Object
                Object.assign(spamData.givenEmails, spamEmails)


            })
        }

                for (let email of Object.values(spamData.givenEmails)){
                    // eslint-disable-next-line no-loop-func
                    email.spammedEmail.foreach(async (mail) => {
                        messages = await gmail.user.messages.list({
                            oAuth2Client,
                            userId: 'me',
                            q: `from:${mail}`
                        })
                    })
                    console.log(email)
                    /!*for (let i = 0; i <= email.length; i++){
                        messages = await gmail.user.messages.list({
                            oAuth2Client,
                            userId: 'me',
                            q: `from:${email}`
                        })
                    }*!/

                }

        return res.json(messages.data.messages)
    } catch (err) {
        if (err.code === "auth/id-token-expired")
            return res.status(401).json({general: 'Login expired, please login again'});
        else
            return res.status(500).json({error: err.code})
    }*/
}

exports.getMessages = async (req, res) => {
    // https://github.com/googleapis/google-api-nodejs-client/issues/1523
    const gmail = google.gmail({version: 'v1', auth: oAuth2Client})

    const test = ['9001603@student.tcrmbo.nl', 'jeremiahkoeiman1@gmail.com']

    try {

        //for (let email of test) {
            // Get all messages from the given email address
            // eslint-disable-next-line no-await-in-loop
            const messages = await gmail.users.messages.list({
                oAuth2Client,
                userId: 'me',
                q: `from:jeremiahkoeiman1@gmail.com`
            })

            /*messages.data.messages.map(async (message) => {
                await gmail.users.messages.modify({
                    oAuth2Client,
                    userId: 'me',
                    id: message.id,
                    removeLabelIds: [
                        'INBOX'
                    ],
                    addLabelIds: [
                        'SPAM'
                    ]
                })
            })*/

            //console.log(email)

            // eslint-disable-next-line no-await-in-loop
            /*await gmail.users.messages.modify({
                oAuth2Client,
                userId: 'me',
                id: messages.data.messages.id,
                removeLabelIds: [
                    'INBOX'
                ],
                addLabelIds: [
                    'SPAM'
                ]
            })*/
        //}

        /*const messages = await gmail.users.messages.list({
            oAuth2Client,
            userId: 'me',
            q: `from:jeremiahkoeiman1@gmail.com`
        })*/

        // Get's the full email
        /*const details = await gmail.users.messages.get({
            oAuth2Client,
            userId: 'me',
            id: '171bb4ed50b0a200',
            format: 'raw'
        })*/

        /*messages.data.messages.map((message) => {
            try {
                (async function () {
                    await gmail.users.messages.modify({
                        oAuth2Client,
                        userId: 'me',
                        id: message.id,
                        removeLabelIds: [
                            'INBOX'
                        ],
                        addLabelIds: [
                            'SPAM'
                        ]
                    })
                })()
            } catch (err) {
                res.json({err})
            }
        })*/

        messages.data.messages.forEach(message => console.log(message.id))

        //messages.data.messages.forEach((message) => res.json([message.id]))
        //console.log(Object.values(messages.data.messages)[0])
        //return res.json('Spammer added')
    } catch (err) {
        console.log(err)
        if (err.code === "auth/id-token-expired")
            return res.status(401).json({general: 'Login expired, please login again'});
        else
            return res.status(500).json({error: err})
    }
}
