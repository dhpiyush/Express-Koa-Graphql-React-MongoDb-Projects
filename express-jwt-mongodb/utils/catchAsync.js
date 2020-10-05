// only used to catch async functions errors
function catchAsync(fn){
 return (req, res, next) => {
     fn(req, res, next).catch(next); //so that the error is passed to the globalErrorFunction
 };
}

module.exports = catchAsync
