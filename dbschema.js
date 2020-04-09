const db = {
    users: [
        {
            userId: 'vgdscjhbakjxdhbgehjnd',
            email: 'user@gmail.com',
            username: 'user',
            // twoFac is an object
            twoFactor: [
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
            body: 'Standard reply body',
            subject: 'Standard reply subject',
            to: [
                'jerry@gmail.com',
                'test2@gmail.com'
            ]
        }
    ],
    spammedEmails: [
        {
            spammedEmailId: 'vyeskhfnbwykwheriyfuber',
            spammedEmail: 'test@gmail.com',
            addedAt: '2019-12-06T15:17:46.433Z'
        }
    ]
}
