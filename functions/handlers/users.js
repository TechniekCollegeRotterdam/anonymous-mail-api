const config = require('../util/config')
const {db, admin} = require('../util/admin')
const {validateUserData, validateLoginData} = require('../util/validators')

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

    const {valid, errors} = validateUserData(newUser)

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

        // Create custom token
        const token = await admin.auth().createCustomToken(userId)

        // Sign in user
        await firebase.auth().signInWithCustomToken(token)

        // TODO: send email verification mail. Login when verified. Comment out line 59

        return res.status(201).json({token})

    } catch (err) {
        console.error(err.code);
        console.error(err.message);
        if (err.code === 'auth/email-already-in-use')
            return res.status(400).json({email: 'Email is already is use'});
        else
            return res.status(500).json({general: 'Something went wrong, please try again'})
    }
}

exports.loginWithEmailAndPassword = async (req, res) => {
    const userCredentials = {
        email: req.body.email,
        password: req.body.password
    }

    const {errors, valid} = validateLoginData(userCredentials)

    if (!valid)
        return res.status(400).json(errors)

    try {
        // Sign in user
        const data = await firebase.auth().signInWithEmailAndPassword(userCredentials.email, userCredentials.password)

        // TODO: Get user data
        /*
        * TODO: Two step authentication for email and sms
        *  pseudocode:
        * swith(user.twoFactor.enable) {
        * case true:
        *   switch(user.twoFactor.type) {
        *       case 'email':
        *           twoStepEmail(user.twoFactor.info)
        *           break
        *       case 'sms':
        *           twoStepSMS(user.twoFactor.info)
        *           break
        *       default:
        *           break
        *   }
        *
        * case false:
        *   break
        * default:
        *   break
        * }
        * */

        // Get user token
        const token = await data.user.getIdToken()

        return res.json({token})

    } catch (err) {
        console.error(err)
        if (err.code === 'auth/wrong-password')
            return res.status(404).json({general: 'Wrong credentials, please try again'});
        else if (err.code === 'auth/user-not-found')
            return res.status(404).json({general: 'Wrong credentials, please try again'});
        else if (err.code === 'auth/invalid-email')
            return res.status(404).json({general: 'Wrong credentials, please try again'});
        else
            return res.status(500).json({error: err.code})
    }
}

exports.getOwnUserData = async (req, res) => {
    let userDetails = {}

    try {
        // Get user
        const user = await db.doc(`/users/${req.user.username}`).get()

        // Check if user exists
        if (user.exists) {
            userDetails.credentials = user.data()
        } else
            return res.status(404).json({error: 'User not found'})

    } catch (err) {
        if (err.code === "auth/id-token-expired")
            return res.status(401).json({general: 'Login expired, please login again'});
        else
            return res.status(500).json({error: err.code})
    }
}

exports.updateUserData = async (req, res) => {
    const updatedUser = {
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        twoFactor: {
            enabled: req.body.twoFactor.enabled,
            type: req.body.twoFactor.type,
            info: req.body.twoFactor.info
        }
    };

    const {valid, errors} = validateUserData(updatedUser)

    if (!valid) return res.status(400).json(errors)

    try {

        const currentUser = await db.doc(`/users/${req.user.username}`).get()

        if (!currentUser.exists){
            return res.status(404).json({user: 'User not found'})
        }

        if (currentUser.data().username !== req.user.username) {
            return res.status(403).json({error: 'Unauthorized'})
        }

        /*const blacklist = db.doc(`/blacklist/${req.params.emailId}`)
        blacklist.get()
            .then(doc => {
                if (!doc.exists) {
                    return res.status(404).json({error: 'Email address not found'})
                }
                if (doc.data().username !== req.user.username) {
                    return res.status(403).json({error: 'Unauthorized'})
                } else {
                    return blacklist.delete()
                }
            })
            // eslint-disable-next-line promise/always-return
            .then(() => {
                res.json({message: 'Blacklist email address deleted successfully'})
            })
            .catch(err => {
                console.error(err)
                if (err.code === "auth/id-token-expired")
                    return res.status(401).json({general: 'Login expired. Please login again'})
                else
                    return res.status(500).json({error: err.code})
            })*/

        await db.doc(`/users/${req.user.username}`).set(updatedUser)

        return res.status(200).json({user: 'User updated'})
    } catch (err) {
        console.error(err.code);
        if (err.code === "auth/id-token-expired")
            return res.status(401).json({general: 'Login expired, please login again'});
        else
            return res.status(500).json({general: 'Something went wrong, please try again'})
    }
}

exports.signOut = async () => {
    return await firebase.auth().signOut()
}
