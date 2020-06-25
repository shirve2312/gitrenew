const uuid = require('node-uuid');
const mongoose = require('mongoose');
const l10n = require('jm-ez-l10n');
const User = require('./userModel');
const userModel = require('./userModel');
const utils = require('../../../helper/utils');
const auth = require('../../../helper/auth');
const logger = require('../../../helper/logger');
const moment = require('moment');
const constants = require('../../../config/constants');
const notification = require('../../../helper/notification');
const aws = require('../../../helper/aws');
const userUtils = {};

userUtils.checkUserExist = (email, field) => {
    return new Promise((resolve, reject) => {
        const query = {};
        if (!email) {
            resolve(false);
        }
        query[field] = email;
        User.count(query).then((count) => {
            resolve(count > 0);
        }).catch((err) => {
            reject(err);
        });
    });
};

userUtils.createSocialUser = (userInfo) => {

    const { provider, signupType, firstName, email } = userInfo;

    const user = new User({
        firstName,
        provider,
        signupType,
        email
    });

    return user.save();
};

userUtils.createUser = (userInfo, apiVersion) => {

    const { password, userType, signupType, status, phone, email, userName } = userInfo;

    const user = new User({
        password,
        userType,
        signupType,
        status,
        userName,
        phone,
        email
    });

    return user.save();
};

userUtils.createGuide = (userInfo, apiVersion) => {

    const { password, userType, signupType, status, phone, email, userName } = userInfo;

    const otpExpireBy = new Date();

    otpExpireBy.setTime(otpExpireBy.getTime() + constants.auth.optExpire);

    const otp = {
        code: auth.generateOtp(),
        expires: otpExpireBy,
    };

    const user = new User({
        password,
        userType,
        signupType,
        status,
        userName,
        phone,
        email,
        otp,
    });

    return user.save();
};

userUtils.uploadImage = (image, user) => {

    if (image) {

        const userToUpdate = user;
        // Upload image
        const body = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        const ext = image.split(';')[0].split('/')[1] || 'jpg';
        const key = `${ uuid.v1() }.${ ext }`;
        aws.putObject({ body, mime: `image/${ ext }` }, key, 'base64')
            .then((result) => {
                userToUpdate.profilePic = result.url;
                userToUpdate.save();
            })
            .catch((err) => {
                logger.error(err);
            });
    }
};

userUtils.sendOtp = (accountVerificationType, phone, email, otp, apiVersion) => {

    // Send OTP

    const { types } = constants.accountVerification;

    if (types.Phone.is(accountVerificationType)) {

        notification.sendSms(phone, otp.code);

    } else if (types.Email.is(accountVerificationType)) {

        // notification.sendMail(email, `email-${ template }`, { link: `${ process.env.RootUrl }/api/${ apiVersion }/user/verify-email/${ email }/${ otp.code }` });
    }

};

userUtils.generateNewOtp = (user) => {

    return new Promise((resolve, reject) => {

        const userToUpdate = user;
        const otpExpireBy = new Date();
        otpExpireBy.setTime(otpExpireBy.getTime() + constants.auth.optExpire);

        const otp = {
            code: auth.generateOtp(),
            expires: otpExpireBy,
        };
        userToUpdate.otp = otp;

        userToUpdate.save().then(() => {
            resolve(otp);
        }).catch((err) => {
            reject(err);
        });
    });

};

userUtils.generateSendOtp = (accountVerificationType, userId, phone, email) => {

    return new Promise((resolve, reject) => {

        User.findOne({ _id: userId }).then((user) => {
            if (!user) {
                resolve({ code: 400, msg: l10n.t('ERR_USER_NOT_FOUND') });
            } else {
                userUtils.generateNewOtp(user).then((otp) => {
                    userUtils.sendOtp(accountVerificationType, phone, email, otp);
                    resolve({ code: 200, msg: l10n.t('MSG_OTP_SENT') });
                }).catch((err) => { reject(err); });
            }
        }).catch((err) => {
            reject(err);
        });
    });
};

module.exports = userUtils;
