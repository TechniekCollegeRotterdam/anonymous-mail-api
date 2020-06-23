const { admin, db } = require('./admin');

module.exports = async (req, res, next) => {

    try {
        let idToken;
        if (req.headers.authorization) {
            idToken = req.headers.authorization
        } else {
            console.error('No token found');
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Get decoded token
        req.user = await admin.auth().verifyIdToken(idToken)

        const data = await db.collection('users').where('userId', '==', req.user.uid).limit(1).get()

        req.user.username = data.docs[0].data().username
        req.user.userId = data.docs[0].data().userId

        return next()

    } catch (err) {
        console.error('Error while verifying token', err);
        return res.status(403).json(err);
    }

}
