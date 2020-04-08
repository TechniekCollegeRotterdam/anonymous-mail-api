const config = require('../util/config')

const firebase = require('firebase')
firebase.initializeApp(config);

exports.signup = (req, res) => {
    res.send('Hello World!')
}
