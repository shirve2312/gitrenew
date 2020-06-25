const Enum = require('enum');

module.exports = {
    pager: {
        limit: 50,
    },
    supportedMime: {
        image: ['image/png', 'image/jpeg', 'image/jpg'],
    },
    auth: {
        loginTypes: new Enum(['Email', 'Social']),
        providers: new Enum(['Google', 'Facebook']),
        // optExpire: 1 * 3600 * 1000, // 1 hour
        optExpire: 60000, // 1 Minute
    },
    user: {
        statuses: new Enum(['NotVerified', 'Active', 'DeActive']),
        genders: new Enum(['Male', 'Female', 'Other']),
        types: new Enum(['Admin', 'Guide', 'User'])
    },
    accountVerification: {
        types: new Enum(['Email', 'Phone']),
    }
};