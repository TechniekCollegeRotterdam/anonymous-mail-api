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
    addSpamEmailAddress,
    sendMail,
    getGmailData
} = require('./handlers/gmail')

const {
    deleteSpamEmailAddress,
    getSpamEmailAddresses,
} = require('./handlers/database')

// User
app.post('/signUpWithEmailAndPassword', signUpWithEmailAndPassword);
app.post('/loginWithEmailAndPassword', loginWithEmailAndPassword)
app.get('/getOwnUserData/:username', protectedRoute, getOwnUserData)
app.post('/updateUserData', protectedRoute, updateUserData)
app.get('/signOut', protectedRoute, signOut)
app.post('/forgotPassword', forgotPassword)

// Mail
app.post('/sendMail', protectedRoute, sendMail)
//app.get('/addSpammer', protectedRoute, addSpammer)
app.get('/gmailData', protectedRoute, getGmailData)

// Database
app.post('/addSpamEmailAddress', protectedRoute, addSpamEmailAddress)
app.delete('/deleteSpamEmailAddress/:emailId', protectedRoute, deleteSpamEmailAddress)
app.get('/getSpamEmailAddresses', protectedRoute, getSpamEmailAddresses)

exports.api = functions.region('europe-west2').https.onRequest(app); 
