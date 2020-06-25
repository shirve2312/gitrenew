const constants = require('../../../config/constants');

const validator = {};
const input = {
    '/signup': {
        loginType: { type: 'isValidEnum', options: { aEnum: constants.auth.loginTypes } },
        email: {
            byPassWhen: (body) => { return !constants.auth.loginTypes.Email.is(body.loginType); },
            rules: [
                { type: 'notEmpty' },
                { type: 'isEmail', msg: 'ERR_VALID_EMAIL' },
            ],
        },
        phone: [
            { type: 'notEmpty' }
        ],
        password: [
            { type: 'notEmpty' },
        ],
        userName: [
            { type: 'notEmpty' },
            { type: 'checkLength', options: { max: 100 } },
        ]
    },
    '/authenticate': {
        loginType: { type: 'isValidEnum', options: { aEnum: constants.auth.loginTypes } },
        email: {
            byPassWhen: (body) => { return !constants.auth.loginTypes.Email.is(body.loginType); },
            rules: [
                { type: 'notEmpty' },
                { type: 'isEmail', msg: 'ERR_VALID_EMAIL' },
            ],
        },
        password: [
            { type: 'notEmpty' },
        ],
    },
    '/forget-password': {
        // email: {
        //   byPassWhen: (body) => { return !constants.auth.loginTypes.Email.is(body.loginType); },
        //   rules: [
        //     { type: 'notEmpty' },
        //     { type: 'isEmail', msg: 'ERR_VALID_EMAIL' },
        //   ],
        // },
    },
    '/reset-password': {
        loginType: { type: 'isValidEnum', options: { aEnum: constants.auth.loginTypes } },
        email: {
            byPassWhen: (body) => { return !constants.auth.loginTypes.Email.is(body.loginType); },
            rules: [
                { type: 'notEmpty' },
                { type: 'isEmail', msg: 'ERR_VALID_EMAIL' },
            ],
        },
        phone: {
            byPassWhen: (body) => { return !constants.auth.loginTypes.Social.is(body.loginType); },
            rules: [
                { type: 'notEmpty' },
                { type: 'isValidPhoneNumber', msg: 'ERR_VALID_PHONE_NUMBER' },
            ],
        },
        otp: [{ type: 'notEmpty' }, { type: 'isInt' }, { type: 'checkLength', options: { min: 5, max: 5 } }],
        password: [
            { type: 'notEmpty' },
            { type: 'validPassword' },
        ],
    },
    '/resend-otp': {
        loginType: { type: 'isValidEnum', options: { aEnum: constants.auth.loginTypes } },
        email: {
            byPassWhen: (body) => { return !constants.auth.loginTypes.Email.is(body.loginType); },
            rules: [
                { type: 'notEmpty' },
                { type: 'isEmail', msg: 'ERR_VALID_EMAIL' },
            ],
        },
        phone: {
            byPassWhen: (body) => { return !constants.auth.loginTypes.Social.is(body.loginType); },
            rules: [
                { type: 'notEmpty' },
                { type: 'isValidPhoneNumber', msg: 'ERR_VALID_PHONE_NUMBER' },
            ],
        },
    },
    '/recover-account-otp': {
        email: [
            { type: 'notEmpty' },
            { type: 'isEmail', msg: 'ERR_VALID_EMAIL' },
        ],
    },
    '/recover-account': {
        loginType: { type: 'isValidEnum', options: { aEnum: constants.auth.loginTypes } },
        recoverEmailId: [
            { type: 'notEmpty' },
            { type: 'isEmail', msg: 'ERR_VALID_EMAIL' },
        ],
        email: {
            byPassWhen: (body) => { return !constants.auth.loginTypes.Email.is(body.loginType); },
            rules: [
                { type: 'notEmpty' },
                { type: 'isEmail', msg: 'ERR_VALID_EMAIL' },
            ],
        },
        phone: {
            byPassWhen: (body) => { return !constants.auth.loginTypes.Social.is(body.loginType); },
            rules: [
                { type: 'notEmpty' },
                { type: 'isValidPhoneNumber', msg: 'ERR_VALID_PHONE_NUMBER' },
            ],
        },
        otp: [{ type: 'notEmpty' }, { type: 'isInt' }, { type: 'checkLength', options: { min: 5, max: 5 } }],
        password: [
            { type: 'notEmpty' },
            { type: 'validPassword' },
        ],
    },
    '/update-profile': {
        fullName: {
            isOptional: false,
            rules: [
                { type: 'checkLength', options: { max: 50 }, msg: 'ERR_VALID_NAME' },
            ],
        },
        // password: [
        //   { type: 'notEmpty' },
        //   { type: 'validPassword' },
        // ],
    },
    '/check-user-exist': {
        loginType: { type: 'isValidEnum', options: { aEnum: constants.auth.loginTypes } },
        email: {
            byPassWhen: (body) => { return !constants.auth.loginTypes.Email.is(body.loginType); },
            rules: [
                { type: 'notEmpty' },
                { type: 'isEmail', msg: 'ERR_VALID_EMAIL' },
            ],
        },
        phone: {
            byPassWhen: (body) => { return !constants.auth.loginTypes.Social.is(body.loginType); },
            rules: [
                { type: 'notEmpty' },
                { type: 'isValidPhoneNumber', msg: 'ERR_VALID_PHONE_NUMBER' },
            ],
        },
    },
};

validator.get = (route) => {
    return input[route];
};

module.exports = validator;
