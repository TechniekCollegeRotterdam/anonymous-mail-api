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
        console.log(err)
        return res.status(500).json({error: 'Something went wrong'})
    }
}


