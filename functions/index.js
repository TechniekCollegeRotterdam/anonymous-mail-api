const functions = require('firebase-functions');
const app = require('express')();

const protectedRoute = require('./util/protectedRoute')

const {
    signUpWithEmailAndPassword,
    loginWithEmailAndPassword,
    getOwnUserData
} = require('./handlers/users');

const {
    sendMail
} = require('./handlers/gmail')

// User
app.post('/signUpWithEmailAndPassword', signUpWithEmailAndPassword);
app.post('/loginWithEmailAndPassword', loginWithEmailAndPassword)
app.get('/getOwnUserData/:username', protectedRoute, getOwnUserData)

// Mail
app.post('/sendMail', protectedRoute, sendMail)

exports.api = functions.region('europe-west2').https.onRequest(app)
