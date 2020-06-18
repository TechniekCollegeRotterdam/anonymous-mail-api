const {db} = require('../util/admin')
const {validateBlacklistData, validateDatabaseData, validateAutoReplyData} = require('../util/validators')

exports.addSpamEmailAddress = async (req, res) => {
    const spamEmailData = {
        username: req.user.username,
        spammedEmail: req.body.spammedEmail,
        addedAt: new Date().toISOString()
    }

    const { valid, errors } = validateDatabaseData(spamEmailData)

    if (!valid) return res.status(400).json(errors)

    try {
        // Add document
        const doc = await db.collection('spammedEmails').add(spamEmailData)

        const addedEmail = spamEmailData
        // Set spammedEmailId to the documents id
        addedEmail.spammedEmailId = doc.id

        return res.json(addedEmail)
    } catch (err) {
        if (err.code === "auth/id-token-expired")
            return res.status(401).json({ general: 'Login expired, please login again' });
        else
            return res.status(500).json({ error: err.code })
    }
}

exports.deleteSpamEmailAddress = async (req, res) => {

    const document = db.doc(`/spammedEmails/${req.params.emailId}`)
    document.get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({error: 'Email address not found'})
            }
            if (doc.data().userHandle !== req.user.handle) {
                return res.status(403).json({error: 'Unauthorized'})
            } else {
                return document.delete()
            }
        })
        // eslint-disable-next-line promise/always-return
        .then(() => {
            res.json({message: 'Spammed email address deleted successfully'})
        })
        .catch(err => {
            console.error(err)
            if (err.code === "auth/id-token-expired")
                return res.status(401).json({general: 'Login expired. Please login again'})
            else
                return res.status(500).json({error: err.code})
        })
}

exports.getSpamEmailAddresses = async (req, res) => {

    let emailData = []

    try {
        const data = await db.collection('spammedEmails').where('username', '==', req.user.username).get()

        if (data.empty) {
            return res.status(404).json({error: 'No spammed email addresses found'})
        } else {
            data.forEach(doc => {
                emailData.push(doc.data())
            })
        }

        return res.json(emailData)
    } catch (err) {
        if (err.code === "auth/id-token-expired")
            return res.status(401).json({general: 'Login expired, please login again'});
        else
            return res.status(500).json({error: err.code})
    }
}

exports.addBlockedEmail = async (req, res) => {
    const blacklistData = {
        username: req.user.username,
        blacklistEmail: req.body.blacklistEmail
    }

    const {valid, errors} = validateBlacklistData(blacklistData)

    if (!valid) return res.status(400).json(errors)

    try {
        const doc = await db.collection('blacklist').add(blacklistData)

        const addedEmail = blacklistData

        addedEmail.blacklistItemId = doc.id

        return res.json(addedEmail)
    } catch (err) {
        if (err.code === "auth/id-token-expired")
            return res.status(401).json({general: 'Login expired, please login again'});
        else
            return res.status(500).json({error: err.code})
    }
}

exports.deleteBlockedEmail = async (req, res) => {

    const blacklist = db.doc(`/blacklist/${req.params.emailId}`)
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
        })
}

// add auto reply route 
exports.addAutoReply = (req, res) => {
 
    const autoReplyData = {
        username: req.user.username, 
        title: req.body.title,
        body: req.body.body,
        subject: req.body.subject,
        to: req.body.to
    }
 
    
    // validatie
 
    const {errors, valid} = validateAutoReplyData(autoReplyData)
 
    if (!valid) 
        return res.status(400).json(errors) //bad request
 
    // promise 
 
    db  
    .collection('autoReplies')
    .add(autoReplyData)
    .then((doc) => {
        const addedAutoReply = autoReplyData
        
        addedAutoReply.id = doc.id

        addedAutoReply.message = 'Auto reply added'
 
        return res.status(200).json(addedAutoReply) //succeed 200
 
    })
    .catch((error) => {
        console.log(error)
 
        if (error.code === "auth/id-token-expired")
            return res.status(401).json({message:'Login expired. Please login again'})
        else
            return res.status(500).json({error: error.code}) //  internal server error
    })
}

exports.getAutoReply = async (req, res) => {

    let autoReplyData = []

    try {
        const data = await db.collection('autoReplies').where('username', '==', req.user.username).get()

        if (data.empty) {
            return res.status(404).json({error: 'No auto replies found'})
        } else {
            data.forEach(doc => {
                autoReplyData.push(doc.data())
            })
        }

        return res.json(autoReplyData)
    } catch (err) {
        if (err.code === "auth/id-token-expired")
            return res.status(401).json({general: 'Login expired, please login again'});
        else
            return res.status(500).json({error: err.code})
    }
}
