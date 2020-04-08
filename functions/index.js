const functions = require('firebase-functions');
const app = require('express')();

const { signUpWithEmailAndPassword } = require('./handlers/users');

app.post('/signUpWithEmailAndPassword', signUpWithEmailAndPassword);

exports.api = functions.region('europe-west2').https.onRequest(app)
