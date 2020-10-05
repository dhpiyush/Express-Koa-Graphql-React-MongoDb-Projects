// const {catchAsync} = require('../utils/catchAsync');
const catchAsync = () => {};
const {AppError} = require('../utils');

//https://mongoosejs.com/docs/queries.html

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findyByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError('No doc found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    })
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    //update user document
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // returns new object
        runValidators: true // if we put invalid email address then we need mongoose to validate
    });

    if (!doc) {
        return next(new AppError('No doc found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    //update user document
    const doc = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    //update user document
    let query = await Model.findById(req.params.id);

    if (popOptions) {
        query = query.populate(popOptions);
    }
    const doc = await query;

    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.getAll = Model => catchAsync(async (req, res, next) => {
    // const features = new APIFeatures(Model.find(), req.query)
    //     .filter()
    //     .sort()
    //     .limitFields()
    //     .paginate()
    const features = Model.find();
    const doc = await features.query;
    // const users = await User.find();

    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        }
    });
});
