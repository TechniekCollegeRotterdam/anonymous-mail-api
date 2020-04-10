const functions = require('firebase-functions');
const app = require('express')();

const {
    signUpWithEmailAndPassword,
    loginWithEmailAndPassword
} = require('./handlers/users');

app.post('/signUpWithEmailAndPassword', signUpWithEmailAndPassword);
app.post('/loginWithEmailAndPassword', loginWithEmailAndPassword)

exports.api = functions.region('europe-west2').https.onRequest(app)
