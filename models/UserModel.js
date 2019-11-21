const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter name']
    },
    email: {
        type: String,
        required: [true, 'please Enter email'],
        unique: [true, 'Email  already in use'],
        lowercase: true,
        validate: [validator.isEmail, 'please enter valid email']
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'guide', 'guide-lead'],
        default: 'user'
    },
    password: {
        type: String,
        minlength: 8,
        required: [true, 'please enter  password'],
        select: false
    },
    photo: String,
    passwordConfirm: {
        type: String,
        required: [true, 'PLease Confirm Password'],
        validate: {
            validator: function(el) {
                return this.password === el;
            },
            message: 'password not same '
        },
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});
// instamce function to be avaliable on all documents

UserSchema.methods.correctPassword = async function(canPassword, dataPassword) {
    // database password hashed
    return await bcrypt.compare(canPassword, dataPassword);
};
// doesnt work on  find  , works on findOne
UserSchema.methods.createPasswordResetToken = function() {
    //create random  token of 32 bits types hex
    const token = crypto.randomBytes(32).toString('hex');

    // to encrpyt it and store it in database
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // storeing expire data as current date + 10 minutes
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return token;
};

UserSchema.methods.passwordChangedat = function(JWTtt) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedat / 1000, 10);
        // if  JWtt is assgined  before password changed then only it will return true
        return JWTtt < changedTimeStamp;
    }

    return false;
};
// middleware for encrypting passwords

UserSchema.pre('save', async function(next) {
    // if (!this.isModified('password')) return next;

    // this.password = await bcrypt.hash(this.password, 12);
    //this.passwordConfirm = undefined;
    next();
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password') || this.isNew) return next;

    this.PasswordChangedAt = Date.now() - 1000;
});

// avoid  those documents from showing which are inactive
UserSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
});

const user = mongoose.model('User', UserSchema);

module.exports = user;
