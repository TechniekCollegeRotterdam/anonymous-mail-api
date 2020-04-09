const config = require('../util/config')
const {db} = require('../util/admin')
const {validateSignUpData} = require('../util/validators')

const firebase = require('firebase')
firebase.initializeApp(config);

exports.signUpWithEmailAndPassword = async (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        twoFactor: {
            enabled: false
        }
    };

    const {valid, errors} = validateSignUpData(newUser)

    if (!valid) return res.status(400).json(errors)

    try {
        // Get user from users collection
        const doc = db.doc(`/users/${newUser.username}`).get()

        // if user exists show 'This username is already taken'
        if (doc.exists) {
            return res.status(400).json({username: 'This username is already taken'})
        }

        // Await creation of new user with email and password
        const data = await firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password);

        // Set userId to the uid given from the data const above this line
        userId = data.user.uid

        // Get users token
        token = await data.user.getIdToken()

        // Object that represents the to be created user document
        const userCredentials = {
            userId,
            email: newUser.email,
            username: newUser.username,
            twoFactor: {
                enabled: false
            }
        }

        // User userCredentials object to create an user document of the new user
        await db.doc(`/users/${newUser.username}`).set(userCredentials)

        // TODO: send email verification mail. Login when verified. Comment out line 57

        return res.status(201).json({ token })

    } catch (err) {
        console.error(err);
        if (err.code === 'auth/email-already-in-use')
            return res.status(400).json({email: 'Email is already is use'});
        else
            return res.status(500).json({general: 'Something went wrong, please try again'})
    }
}
