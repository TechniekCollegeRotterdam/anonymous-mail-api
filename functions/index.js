const functions = require('firebase-functions');
const app = require('express')();

const {
    signUpWithEmailAndPassword,
    loginWithEmailAndPassword
} = require('./handlers/users');

const {
    sendMail
} = require('./gmail')

// User
app.post('/signUpWithEmailAndPassword', signUpWithEmailAndPassword);
app.post('/loginWithEmailAndPassword', loginWithEmailAndPassword)

// Mail
app.get('/sendMail', sendMail)

exports.api = functions.region('europe-west2').https.onRequest(app)
