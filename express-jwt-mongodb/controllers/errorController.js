const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400)
}

const handleDuplicateFields = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
    const message = `Duplicate field value: ${value}. Please use another value`;
    return new AppError(message, 400)
}

const handleValidationErrorDB = err =>{
    const errors = Object.values(err.errors).map(el => el.message)
    const message = `Invalid input data ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const sendErrorDev = (err, req, res) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err,
            stack: err.stack
        });
    }else{
        //Render website
        // return res.status(err.statusCode).render('error', {
        //     title: 'something went wrong',
        //     msg: err.msg
        // })
    }
    
}

const sendErrorProd = (err, res) => {
    //A) API
    if (req.originalUrl.startsWith('/api')) {
        // Operational, trusted error: send message to client
        // error coming from AppError 
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        // Programming or other unknown error: don't leak error details    
        }else{
            // log error
            console.error('ERROR', err)
            
            //send generic message
            return res.status(500).json({
                status: 'error',
                message: 'Something went wrong'
            });
        }
    }else{
        //render website
        if (err.isOperational) {
            // return res.status(err.statusCode).render('error', {
        //     title: 'something went wrong',
        //     msg: err.msg
        // })    
        }else{
            // log error
            console.error('ERROR', err)
            
            //send generic message
            // return res.status(err.statusCode).render('error', {
        //     title: 'something went wrong',
        //     msg: 'Please try again later'
        // }) 
        }
    }
    
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }else if(process.env.NODE_ENV === 'production'){
        let error = {...err};
        error.message = err.message;

        // Error for invalid db ID sent to mongoose
        if (error.name === 'CastError') error = handleCastErrorDB(error);

        // Error for duplicate data fields
        if (error.code === 11000) error = handleDuplicateFields(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

        sendErrorProd(error, res);
    }
    
}