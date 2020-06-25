const mongoose = require('mongoose');
const config = require('../../../config/config');
const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    profilePicture: {
        type: String,
    },
    phone: {
        type: String,
        required: true
    },
    provider: {
        id: {
            type: String,
        },
        platform: {
            type: String,
            enum: ['Google', 'Facebook']
        },
    },
    otp: {
        code: {
            type: String,
        },
        expires: {
            type: Date,
        },
        _id: false,
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['NotVerified', 'Active', 'DeActive'],
        default: 'Active',
    },
    signupType: {
        type: String,
        enum: ['Email', 'Social'],
        required: true,
    },
    userType: {
        type: String,
        enum: ['Admin', 'Guide', 'User'],
        required: true,
    },
    dob: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    isBlock: {
        type: Boolean,
        default: false
    },
    address: {
        addressLine: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        country: {
            type: String,
        },
        pinCode: {
            type: String,
        },
    },
    platform: {
        type: String
    },
}, {
    collection: 'users',
    timestamps: true,
    versionKey: false
});

const User = mongoose.model('users', userSchema);
module.exports = User;