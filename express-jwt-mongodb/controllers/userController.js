const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const {AppError} = require('../utils');
const factory = require('./handlerFactory'); 

exports.getMe = (req, res, next) =>{
    req.params.id = req.user.id;
    next();
};

const filterObj = (obj, ...allowedFields) =>{
    const newObj = {};
    Object.keys(obj).forEach(key =>{
        if (allowedFields.includes(key)) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
}

exports.updateMe = catchAsync(async (req, res, next) => {
    //1. create error if user tries to update password
    if (req.body.password || req.body.confirmPassword) {
        return next(new AppError('The route is not for password updates. Please use /updateMyPassword'), 400);
    }

    // 2. filter fields
    const filteredBody = filterObj(req.body, 'name', 'email'); //filter the objects that we need to update
    
    //3. update user document
    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true, // returns new object
        validators: true // if we put invalid email address then we need mongoose to validate
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updateUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    //this active is set to false and not actually the user is deleted
    const updateUser = await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
        status: 'success',
        data: null
    });
});

//DO NOT update PASSWORD with this
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
