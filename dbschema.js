const db = {
    users: [
        {
            userId: 'vgdscjhbakjxdhbgehjnd',
            email: 'user@gmail.com',
            username: 'user',
            // twoFac is an object
            twoFactorEnabled: true,
            type: 'email',
            info: 'user@gmail.com'
        }
    ],
    blacklist: [
        {
            blacklistItemId: 'sdhcbsdgvteyschcsbdrvug',
            blockedEmail: 'friend@gmail.com'
        }
    ],
    autoReplies: [
        {
            autoRepliesItemId: 'chbdvgsdhchbsjd',
            title: 'Standard reply',
            body: 'Standard reply body',
            subject: 'Standard reply subject',
            to: 'jerry@gmail.com'
        }
    ],
    spammedEmails: [
        {
            username: 'user',
            spammedEmail: 'test@gmail.com',
            addedAt: '2019-12-06T15:17:46.433Z'
        }
    ]
}
