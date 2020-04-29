const {db} = require('../util/admin')
const {validateDatabaseData} = require('../util/validators')

exports.addSpamEmailAddress = async (req, res) => {
    const spamEmailData = {
        username: req.user.username,
        spammedEmail: req.body.spammedEmail,
        addedAt: new Date().toISOString()
    }

    const {valid, errors} = validateDatabaseData(spamEmailData)

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
            return res.status(401).json({general: 'Login expired, please login again'});
        console.log(err)
        return res.status(500).json({error: 'Something went wrong'})
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
        console.log(err)
        return res.status(500).json({error: err.code})
    }
}
