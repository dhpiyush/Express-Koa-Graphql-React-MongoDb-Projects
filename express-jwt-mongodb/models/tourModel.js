// const tourSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         unique: true,
//         required: [true, 'A tour must have a name!']
//     },
//     guides:[
//         {
//             type: mongoose.Schema.ObjectId,
//             ref: 'User'
//         }
//     ] // or Array (if we are embedding user details into guides)
//     photo: String
// });


// Document Middleware: runs before .save() and .create()
// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidePromises);
//     next();
// })

// tourSchema.pre(/^find/, function (next) {
//     this.populate({
    // path: 'guides',
    // select: '-__v -passwordChangedAt' // this will remove these 2 fields from User inside guides field of tour when mongo is embedding user into tour
    //        or 'name id' (names of fields you want)
// });
// })

//virtual populate
// tourSchema.virtual('reviews', {
//     ref: 'Review',
//     foreignField: 'tour', // in review model we have field tour
//     localField: '_id' // id is called in the foreign Model
// }); // in order to get Tour.findById(id).populate('reviews')
