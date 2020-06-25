const nodemailer = require('nodemailer');
const logger = require('./logger');
const aws = require('./aws');

const sendMail = (to, templateName, data) => {


};

const sendSms = (to, OTP) => {
    aws.publishSnsSMS(to, OTP + ' is your OTP to verify your phone number.').then((done) => {
        logger.info(done);
    }).catch((publishErr) => {
        logger.error(publishErr);
    });
};

module.exports = {
    sendMail,
    sendSms
};

