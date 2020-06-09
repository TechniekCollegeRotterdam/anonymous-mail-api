const db = {
    users: [
        {
            userId: 'vgdscjhbakjxdhbgehjnd',
            email: 'user@gmail.com',
<<<<<<< HEAD
            userName: 'user',
            twoFac: [
                {
                    enabled: true,
                    type: 'phonenuber',
                    info: '06000000000'
                },
=======
            username: 'user',
            // twoFac is an object
            twoFactor: [
>>>>>>> develop
                {
                    enabled: true,
                    type: 'email',
                    info: 'user@gmail.com'
                }
            ],
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
<<<<<<< HEAD
            body: 'Standard reply body'
        }
    ],
    spamedEmail: [
        {
            spamedEmailId: 'vyeskhfnbwykwheriyfuber',
            spamedEmail: 'test@gmail.com'
=======
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
>>>>>>> develop
        }
    ]
}
