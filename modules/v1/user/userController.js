const _ = require("lodash");
const mongoose = require("mongoose");
const passwordHash = require("password-hash");
const logger = require("../../../helper/logger");
const auth = require("../../../helper/auth");
const constants = require("../../../config/constants");
const jwt = require("../../../helper/jwt");
const User = require("./userModel");
const userUtils = require("./userUtils");
const aws = require("../../../helper/aws");
const utils = require("../../../helper/utils");
let path = require("path");
const config = require("../../../config/config");
const notification = require('../../../helper/notification');

const userCtr = {};

// Normal Signup
userCtr.signup = (req, res) => {

    const {
        loginType,
        phone,
        email,
        password,
        userName
    } = req.body;

    const userData = {
        password: passwordHash.generate(password),
        signupType: loginType,
        userType: constants.user.types.User.key,
        status: constants.user.statuses.NotVerified.key,
        userName: userName,
        email: email,
        phone: phone
    };

    if (req.body) {

        User.findOne({ email: email }).then(result => {

            if (result && result.status === "NotVerified") {

                return res.status(406).json({
                    error: req.t("ERR_USER_NOT_VERIFIED_EMAIL")
                });

            } else if (result && result.status === "Active") {

                return res.status(400).json({
                    error: req.t("ERR_USER_ALREADY_EXIST")
                });

            } else {

                userUtils.createUser(userData, req.apiVersion).then(savedUser => {

                    console.log('====================================');
                    console.log(savedUser);
                    console.log('====================================');

                    // notification.sendSms(phone, savedUser.otp.code);

                    return res.status(200).json({
                        message: req.t("MSG_ACCOUNT_CREATED")
                    });

                    // sendGridUtils.sendEmail(
                    //     email,
                    //     userName,
                    //     "emailAccountActivate",
                    //     "Account And Email Verification",
                    //     (err, isEmailSent) => {
                    //         if (isEmailSent) {
                    //             return res.status(200).json({
                    //                 message: req.t("MSG_ACCOUNT_CREATED")
                    //             });
                    //         } else {
                    //             logger.error("[Error in login(super) mail sending failure]", err);
                    //         }
                    //     }
                    // );

                }).catch(err => {
                    logger.error(err);
                    return res.status(500).json({ error: req.t("ERR_INTERNAL_SERVER") });
                });
            }
        }).catch(err => {
            logger.error(err);
            return res.status(500).json({ error: req.t("ERR_INTERNAL_SERVER") });
        });
    } else {
        return res.status(500).json({ error: req.t("ERR_INTERNAL_SERVER") });
    }
};

// Guid Signup
userCtr.guideSignup = (req, res) => {

    const {
        loginType,
        phone,
        email,
        password,
        userName
    } = req.body;

    const userData = {
        password: passwordHash.generate(password),
        userType: constants.user.types.Guide.key,
        signupType: loginType,
        status: constants.user.statuses.NotVerified.key,
        userName: userName,
        email: email,
        phone: phone
    };

    if (req.body) {

        User.findOne({ email: email }).then(result => {

            if (result && result.status === "NotVerified") {

                return res.status(406).json({
                    error: req.t("ERR_USER_NOT_VERIFIED_EMAIL")
                });

            } else if (result && result.status === "Active") {

                return res.status(400).json({
                    error: req.t("ERR_USER_ALREADY_EXIST")
                });

            } else {

                userUtils.createUser(userData, req.apiVersion).then(savedUser => {

                    console.log('====================================');
                    console.log(savedUser);
                    console.log('====================================');

                    notification.sendSms(phone, savedUser.otp.code);

                    return res.status(200).json({
                        message: req.t("MSG_ACCOUNT_CREATED")
                    });

                    // sendGridUtils.sendEmail(
                    //     email,
                    //     userName,
                    //     "emailAccountActivate",
                    //     "Account And Email Verification",
                    //     (err, isEmailSent) => {
                    //         if (isEmailSent) {
                    //             return res.status(200).json({
                    //                 message: req.t("MSG_ACCOUNT_CREATED")
                    //             });
                    //         } else {
                    //             logger.error("[Error in login(super) mail sending failure]", err);
                    //         }
                    //     }
                    // );

                }).catch(err => {
                    logger.error(err);
                    return res.status(500).json({ error: req.t("ERR_INTERNAL_SERVER") });
                });
            }
        }).catch(err => {
            logger.error(err);
            return res.status(500).json({ error: req.t("ERR_INTERNAL_SERVER") });
        });
    } else {
        return res.status(500).json({ error: req.t("ERR_INTERNAL_SERVER") });
    }
};

// Send verification code
userCtr.sendVerificationCode = (req, res) => {

    const { email, phone } = req.body;
    let userId = mongoose.Types.ObjectId(req.user._id);

    if (email) {

        User.findOne({ _id: userId }).then(user => {
            if (!user) {
                res.status(400).json({ error: req.t("ERR_USER_NOT_FOUND") });
            } else {

                if (!user.emailVerified) {

                    userUtils.generateSendOtp(constants.accountVerification.types.Email.key, userId, null, email).then(otpSend => {

                        return res.status(200).json({
                            message: req.t("VERIFICATION_CODE_SEND_SUCCESSFULLY")
                        });

                    }).catch(otpError => {
                        logger.error(otpError);
                        return res.status(500).json({ error: req.t("ERR_SENDING_OTP") });
                    });

                } else {
                    return res.status(400).json({ error: req.t("ERR_EMAIL_ALREADY_VERIFIED") });
                }
            }
        }).catch(err => {
            logger.error(err);
            return res.status(500).json({ error: req.t("ERR_INTERNAL_SERVER") });
        });

    } else if (phone) {

        User.findOne({ _id: userId }).then(user => {
            if (!user) {
                res.status(400).json({ error: req.t("ERR_USER_NOT_FOUND") });
            } else {

                if (!user.phoneVerified) {

                    userUtils.generateSendOtp(constants.accountVerification.types.Phone.key, userId, phone, null).then(otpSend => {

                        return res.status(200).json({
                            message: req.t("VERIFICATION_CODE_SEND_SUCCESSFULLY")
                        });

                    }).catch(otpError => {
                        logger.error(otpError);
                        return res.status(500).json({ error: req.t("ERR_SENDING_OTP") });
                    });

                } else {
                    return res.status(400).json({ error: req.t("ERR_PHONE_ALREADY_VERIFIED") });
                }
            }
        }).catch(err => {
            logger.error(err);
            return res.status(500).json({ error: req.t("ERR_INTERNAL_SERVER") });
        });

    }
};

// verify OTP
userCtr.verifyOTP = (req, res) => {

    const { isEmail, isPhone, otp } = req.body;
    let userId = mongoose.Types.ObjectId(req.user._id);

    const query = {
        _id: userId
    };
    query["otp.code"] = otp;
    query["otp.expires"] = {
        $gte: new Date()
    };

    console.log('====================================');
    console.log(query);
    console.log('====================================');

    User.findOne(query).then(result => {

        console.log('====================================');
        console.log(result);
        console.log('====================================');

        if (isEmail) {

            User.findOneAndUpdate({ _id: userId }, { emailVerified: true }).then(updateProfile => {

                res.status(200).json({ message: req.t("EMAIL_VERIFIED_SUCCESSFULLY") });

            }).catch(errProfile => {
                logger.error("Error! While Update user profile", errProfile);
                return res.status(400).json({
                    error: req.t("ERR_TO_VERIFY_OTP")
                });
            });

        } else if (isPhone) {

            User.findOneAndUpdate({ _id: userId }, { phoneVerified: true }).then(updateProfile => {

                res.status(200).json({ message: req.t("PHONE_VERIFIED_SUCCESSFULLY") });

            }).catch(errProfile => {
                logger.error("Error! While Update user profile", errProfile);
                return res.status(400).json({
                    error: req.t("ERR_TO_VERIFY_OTP")
                });
            });

        }

    }).catch(() => {
        return res.status(400).json({
            error: req.t("ERR_TO_VERIFY_OTP")
        });
    });

};

// Login
userCtr.authenticate = (req, res) => {

    const { loginType, email, password, userPlatform } = req.body;

    User.findOne({ email: email }).then(user => {

        if (!user) {
            res.status(400).json({ error: req.t("ERR_USER_NOT_FOUND") });
        } else {

            if (
                constants.user.statuses.Active.is(user.status) ||
                constants.user.statuses.NotVerified.is(user.status)
            ) {
                if (passwordHash.verify(password, user.password)) {

                    User.findOneAndUpdate(
                        { email: req.body.email },
                        { platform: req.body.userPlatform }).then(updateResult => {
                            console.log('User platform added into the profile');
                        }).catch(err => {
                            logger.error("Error! While Update user platform", err);
                        });

                    const token = jwt.getAuthToken({ id: user._id });

                    return res.status(200).json({ token: token });

                } else {
                    return res.status(400).json({ error: req.t("ERR_PASSWORD_NOT_MATCHED") });
                }
            } else {
                return res.status(406).json({ error: req.t("ERR_USER_BLOCKED") });
            }
        }
    }).catch(err => {
        logger.error(err);
        return res.status(500).json({ error: req.t("ERR_INTERNAL_SERVER") });
    });
};

// SignUp With Social App
userCtr.authenticateProvider = (req, res) => {

    const {
        provider,
        firstName,
        email
    } = req.body;

    const {
        id,
        accessToken
    } = req.body.socialInfo;

    // Find User
    User.findOne({
        "provider.id": id,
        "provider.platform": provider
    }).then(user => {

        auth.socialCheck({ id, accessToken }, provider).then(() => {

            if (user) {

                const token = jwt.getAuthToken({ id: user._id });

                return res.status(200).json({ token, isNewUser: false });

            } else {

                userUtils.createSocialUser({
                    firstName,
                    provider: {
                        id,
                        platform: provider
                    },
                    signupType: "Social",
                    email
                }).then(newUser => {

                    const token = jwt.getAuthToken({ id: newUser._id });

                    return res.status(200).json({ token, isNewUser: true });

                }).catch(err => {
                    logger.error(err);
                    return res.status(500).json({ error: req.t("ERR_INTERNAL_SERVER") });
                });
            }

        }).catch(err => {
            logger.error(err);
            return res.status(500).json({ error: req.t("ERR_INTERNAL_SERVER") });
        });

    }).catch(err => {
        logger.error("User does not exists", err);
        return res.status(500).json({ error: req.t("NOT_FOUND") });
    });
};

// Get User profile
userCtr.getProfile = (req, res) => {

    let userId = mongoose.Types.ObjectId(req.user._id);

    User.findOne({ _id: userId }).then(result => {

        if (result) {

            res.status(200).json({ data: result });
        }

    }).catch(() => {
        return res.status(500).json({
            error: req.t("ERR_INTERNAL_SERVER_ERROR")
        });
    });
};

module.exports = userCtr;