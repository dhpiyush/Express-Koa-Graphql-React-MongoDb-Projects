const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cant be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
    
}, 
{
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});

// reviewSchema.virtual('ratingss').get(function(){ //this will create a virtual field which is no need to store on the DB
//     return this.rating;
// });

// there should be only one review by one user for one tour .... remove duplicate reviews
// reviewSchema.index({tour: 1, user: 1}, {unique: true}); // each combination of tour and user is going to be unique

// const Tour = require('./tourModel');
// reviewSchema.statics.calAvgRatings = async function(tourId){
//     const stats = await this.aggregate([
//         {
//             $match: {tour: tourId}
//         },
//         {
//             $group: {
//                 _id: '$tour', // grp by id of tour
//                 nRating: {$sum: 1}, // add 1 for each document that match
//                 avgRating: {$avg: '$rating'} // avg of rating
//             }
//         }
//     ]);
    // if (stats.length >0) {
        // await Tour.findByIdAndUpdate(tourId, {
//         ratingsQuantity: stats[0].nRating,
//         ratingsAverage: stats[0].avgRating
//     });
    // }else{
        //     await Tour.findByIdAndUpdate(tourId, {
//         ratingsQuantity: stats[0].nRating,
//         ratingsAverage: stats[0].avgRating
//     });
    // }

// };

// DOCUMENT MIDDLEWARE: runs before .save() and .create()

// reviewSchema.pre('save', function (next) {
    // next();
// });

// reviewSchema.post('save', function (doc, next) {
    // next();
// });


// reviewSchema.post('save', function () {
    // 'this' points to current reviews(query)
//     this.constructor.calAvgRatings(this.tour);
// });


//QUERY MIDDLEWARE
// reviewSchema.pre('/^findOneAnd/', function () {
    // 'this' points to current reviews(query)
//     this.r = this.findOne();
//  this.start = Date.now();
//      next();
// });

// reviewSchema.post('/^findOneAnd/', function (docs, next) {
    // console.log(docs);
    // console.log(`Query took ${Date.now() - this.start}`)
//      next();
// });

// reviewSchema.post('/^findOneAnd/', function () {
    // await this.findOne(); does not work here, query has already executed
//     await this.r.constructor.calAvgRatings(this.tour);
// });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;