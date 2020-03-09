const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.env');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.REACT_APP_DATABASE_URL
});

const db = admin.firestore();

module.exports = { admin, db };
