const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory'); 
const APIFeatures = require('../utils/apiFeatures');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find();
    //const reviews = await Review.find().explain();

    // const features = new APIFeatures(Review.find(), req.query).filter().sort().limitFields().paginate();
    // const reviews = await features.query; 

 
    //4. pagination ?page=2&limit=10
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit - 1 || 100
    // const skip = (page - 1) * limit;
    //page=3&limit=10, 1-10,page1,  11-20, page2
    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //     const numReviews = await Review.countDocuments();
    //     if (skip > numRReviews) {
    //         throw new Error('This page does not exist')
    //     }
    // }


    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

exports.createReview = catchAsync(async (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    // const newReview = await Review.create(req.body);

    // res.status(200).json({
    //     status: 'success',
    //     data: {
    //         review : newReview
    //     }
    // });
    return factory.createOne(Review);
});

//NOT  relevant to the fields defeined in Review. Just to show how aggregate works
//AGREGATE
// exports.getReviewStats = catchAsync(async(req,res,next) =>{
//     const stats = await Review.aggregate([
//         {
//             $match : { ratingsAverage : {$gte: 4.5}}
//         },
//         {
//             $group : {
//                 _id: null,
//                 avgRating : { $avg: '$ratingsAverage'},
//                 minPrice : {$min : '$price'}
//             }
//         },
            // {
            //     $sort: {minPrice: 1}
            // }
//     ]);
// });

// exports.getMonthlyPlan = catchAsync(async(req,res,next) =>{
//     const stats = await Review.aggregate([
//         {
//             $unwind : '$startDates
//         },
// {
//     $match: {
//         $startDates: {
//             $gte: 
//             $lte: new Date()
//         }
//     },
//     {
//         $group: {
//             _id: { $month: '$startDates'},
//             numTourStarts: {$sum : 1}
//         }
//     },
//     {
//         $addField: { month: '$_id'}
//     }
// }
//         {
//             $group : {
//                 _id: null,
//                 avgRating : { $avg: '$ratingsAverage'},
//                 minPrice : {$min : '$price'}
//             }
//         },
            // {
            //     $sort: {minPrice: 1}
            // }
//     ]);
// });


exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);