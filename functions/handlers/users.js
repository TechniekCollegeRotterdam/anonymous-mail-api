const config = require('../util/config')
const {db, admin} = require('../util/admin')
const {validateUserData, validateLoginData, validateForgottenPasswordData} = require('../util/validators')

const firebase = require('firebase')
firebase.initializeApp(config);

exports.signUpWithEmailAndPassword = async (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        twoFactorEnabled: false
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
        const token = await data.user.getIdToken()

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

exports.getOwnUserData = (req, res) => {

    // Get user
    db.collection('users').where('username', '==', req.user.username).get()
        .then((snapshot) => {
            // eslint-disable-next-line promise/always-return
            if (snapshot.empty)
                return res.status(404).json({error: 'User not found'})

            snapshot.forEach((doc) => {
                return res.status(200).json(doc.data())
            })
        })
        .catch((err) => {
            if (err.code === "auth/id-token-expired")
                return res.status(401).json({general: 'Login expired, please login again'});
            else
                return res.status(500).json({error: err.code})
        })
}

exports.updateUserData = async (req, res) => {
    const updatedUser = {
        email: req.body.email,
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

        if (!currentUser.exists) {
            return res.status(404).json({user: 'User not found'})
        }

        if (currentUser.data().username !== req.user.username) {
            return res.status(403).json({error: 'Unauthorized'})
        }

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

exports.forgotPassword = async (req, res) => {
    const email = req.body.email

    const {errors, valid} = validateForgottenPasswordData(email)

    if (!valid) return res.status(400).json(errors)

    try {
        // Check if user has sign in method
        const getUserAccount = await firebase.auth().fetchSignInMethodsForEmail(email)

        // If user has sign in method send forgot password mail
        if (!getUserAccount.empty) {
            await firebase.auth().sendPasswordResetEmail(email)

            return res.status(200).json({general: 'Email has been send!'})
        } else {
            return res.status(403).json({general: 'Whoops! We don\'t know that email address'})
        }

    } catch (err) {
        console.log(err)
        if (err.code === 'auth/user-not-found')
            return res.status(403).json({general: 'Whoops! We don\'t know that email address'})
    }
}
