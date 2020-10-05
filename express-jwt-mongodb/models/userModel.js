const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email:{
        type: String,
        required: [true, 'Please tell us your email!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please prrovide valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'admin', 'lead'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        //this only works on CREATE and SAVE !!!
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not same'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date, //10mins to set,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
    
});

// userSchema.index({email: 1, name: -1}); // indexing is used based on apps data access pattern. Helps to search and respond faster

userSchema.pre('save', async function (next) {
    // only run this function if password was actually modified
    if (!this.isModified('password')) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 12);
    // delete confirmed password
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', async function (next) {
    // only run this function if password was actually modified
    if (!this.isModified('password') || this.isNew) {
        return next();
    }

    this.passwordChangedAt = Date.now() - 1000; // subracting few millisecs because sometimes data is updated after issuing the jwt token 
    next();
});

//starting with word find eg findById
// it is query middleware
userSchema.pre(/^find/, function (next) {
    //this points to current query
    this.find({active: {$ne: false}});
    next();
});


userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000, 10)
        return JWTTimestamp < changedTimestamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 10*60*1000; //10mins

    return resetToken;
}

const User = mongoose.model('User', userSchema); //name of the model and the schema

module.exports = User;