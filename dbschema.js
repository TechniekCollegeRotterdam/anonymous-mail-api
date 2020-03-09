const db = {
    users: [
        {
            userId: 'vgdscjhbakjxdhbgehjnd',
            email: 'user@gmail.com',
            userName: 'user',
            twoFac: [
                {
                    enabled: true,
                    type: 'phonenuber',
                    info: '06000000000'
                },
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
            body: 'Standard reply body'
        }
    ],
    spamedEmail: [
        {
            spamedEmailId: 'vyeskhfnbwykwheriyfuber',
            spamedEmail: 'test@gmail.com'
        }
    ]
}
