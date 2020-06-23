const functions = require('firebase-functions');
const app = require('express')();

const protectedRoute = require('./util/protectedRoute')

const {
    signUpWithEmailAndPassword,
    loginWithEmailAndPassword,
    getOwnUserData,
    updateUserData,
    signOut,
    forgotPassword
} = require('./handlers/users');

const {
    sendMail,
    getGmailData,
    addSpammer
} = require('./handlers/gmail')

const {
    addSpamEmailAddress,
    deleteSpamEmailAddress,
    getSpamEmailAddresses,
    addAutoReply,
    getAutoReply
} = require('./handlers/database')

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Request-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Request-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
    next();
});

// User
app.post('/signUpWithEmailAndPassword', signUpWithEmailAndPassword);
app.post('/loginWithEmailAndPassword', loginWithEmailAndPassword)
app.get('/getOwnUserData', protectedRoute, getOwnUserData)
app.post('/updateUserData', protectedRoute, updateUserData)
app.get('/signOut', protectedRoute, signOut)
app.post('/forgotPassword', forgotPassword)

// Mail
app.post('/sendMail', protectedRoute, sendMail)
app.get('/addSpammer', protectedRoute, addSpammer)
app.get('/gmailData', protectedRoute, getGmailData)

// Database
app.post('/addSpamEmailAddress', protectedRoute, addSpamEmailAddress)
app.delete('/deleteSpamEmailAddress/:spammedEmailId', protectedRoute, deleteSpamEmailAddress)
app.get('/getSpamEmailAddresses', protectedRoute, getSpamEmailAddresses)
app.post('/addAutoReply', protectedRoute, addAutoReply) // add auto route
app.get('/getAutoReplies', protectedRoute, getAutoReply)

exports.api = functions.region('europe-west2').https.onRequest(app); 
