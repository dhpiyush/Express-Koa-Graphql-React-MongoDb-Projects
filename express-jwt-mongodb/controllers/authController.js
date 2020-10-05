const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
// const {AppError, promisify} = require('../utils');
const Email = require('../utils/email');
const crypto = require('crypto');

const config = require('config');
const JWT_SECRET = config.get('jwt-token');
const JWT_EXPIRES_IN = config.get('jwt-expires-in');

const signToken = id => {
    return jwt.sign({id}, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, req, res) =>{
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + config.jwt-cookie-expires*24*60*60*1000),
        httpOnly: true, // cookie cannot be modified by client
        secure: req.secure || req.headers('x-forwaded-proto') === 'https' //heroku sets header in this way for secure connection
        // need to set app.enable('trust proxy) inorder to get this header
    };
    
    //sent over to client and automatically added to browser and sent over any call later
    res.cookie('jwt', token, cookieOptions);

    //remove password from output
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    });

    const url = `${req.protocol}://${req.get('host')/me}`
    await new Email(newUser, url).sendWelcome();

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsync(async (req,res, next)=> {
    const {email, password} = req.body;

    if(!email || !password){
        return new AppError('Please provide email and password', 401);
    }

    // check if user exists and password is correct
    const user = await User.findOne({email}).select('+password');
    const correct = user && await user.correctPassword(password, user.password);
    
    if (!user || !correct) {
        return next(new AppError('Incorrect email & password', 401));
    }
    createSendToken(user, 200, req, res);
});

exports.logout = (req, res) =>{
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10*1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
};

// check authenticity of jwt
exports.protect = catchAsync( async(req, res, next) =>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorizations.split(' ')[1];
    }else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }

    if(!token){
        return next(new AppError('You are not logged in! Please login in to get access'));
    }

    const decoded = await promisify(jwt.verify)(token, JWT_SECRET);

    //check if the user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new AppError('The user belonging to this token does not exist'));
    }

    // check if the user changed password after token was issued
    if(freshUser.changesPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password! Please log in again'));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = freshUser; 
    next();
});

// only for rendered pages, no errors!
exports.isLoggedIn =  async(req, res, next) =>{
    let token;
    if(req.cookies.jwt){
        try{
            token = req.cookies.jwt;
        
            // if(!token){
            //     return next(new AppError('You are not logged in! Please login in to get access'));
            // }

            // verify token
            const decoded = await promisify(jwt.verify)(token, JWT_SECRET);

            //check if the user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // check if the user changed password after token was issued
            if(freshUser.changesPasswordAfter(decoded.iat)){
                return next();
            }

            // there is a logged in user
            res.locals.user = currentUser; 
            // can access user in views page, similar to sending user in render variables to the page
            return next();
        }catch(err){
            return next();
        }
    }
    next();
};

exports.restrictTo = (...roles) => {
    //roles are ['admin', 'lead']
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError('You dont have permission to perform this action', 403))
        }
        next();
    };
};

exports.forgotPassword = async (req, res, next) => {
    // get user based on posted email
    const user = User.findOne({email: req.body.email})
    if(!user){
        return next(new AppError('There is no user', 404))
    }

    //generate random token not jwt
    const resetToken = user.createPasswordResetToken();
    user.save({validateBeforeSave: false}); // will make all validators to not run 

    try {
    //send it to users email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    // const message = `Forgot your Password? Submit new password to: ${resetUrl}.\n If you didn't forget your password
    // please ignore this mail!  `

    
        // await sendMail({
        //     email: user.email,
        //     subject: 'Your password reset link is valid for 10mins only',
        //     message
        // });
        await new Email(user, resetUrl).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Token sent to mail!'
        });
    } catch (error) {
        // expire reset token
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppError('There was an error sending the mail. Try again later!', 500))
    }
};

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1. get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt : Date.now()}
    });

    //2. if user has not expired, and there is a user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save()

    //3. update changePasswordAt property for the user

    //4. log the user in, send JWT
    createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1. get the user from collection
    // the request will come from logged in user, i.e from protect middleware so we will have id
    const user = User.findOne(req.user.id).select('+password');

    //2. check if posted current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Your current password is wrong.', 401));
    }

    //3. if so update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm // the validator will automatically validate passwords
    await user.save();
    //user.findByIdAndUpdate will not work as intended! middlewares as well as validators wont work

    //4. log user in, send JWT
    createSendToken(user, 200, req, res);
});