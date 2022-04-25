const dotenv = require('dotenv');
const AppError = require('../Model/AppError');

//Mogoose Related Error Handling Start
//1. if you get tour and it object id passed in wrong format then cast error will come.  
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};
//2. if we try to insert value which name is already inside collection then it throw duplicate value error.  
const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);

    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

//3. if we try to insert value which failed in validation schema then it will throw object of all errors.  
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};
//Mogoose Related Error Handling End 

//JWT Token Error Handler Start

const handleJWTValidationError = err => {
    return new AppError("Invalid token please login again!", 401);
};
//End

const ErrorProd = (req, res, err) => {
    if (err.isOperationalErr) {

        if (req.originalUrl.startsWith("/api")) {
            return res.status(err.statusCode).json({
                status: err.status,
                messsage: err.message,
            });
        }
        else {
            res.status(err.statusCode).render("error", {
                title: "Something went wrong!!",
                message: err.message,
            });
        }
    }
    else {
        if (req.originalUrl.startsWith("/api")) {
            res.status(500).json({
                status: "error",
                message: "Something Went Wrong",
            });
        }
        else {
            res.status(err.statusCode).render("error", {
                title: "Something went wrong!!",
                message: "Please try again after sometime!!",
            });
        }
    }
}

const ErrorDev = (req, res, err) => {
    //193
    //Display error page for server side rendering so
    //and also we are handling apis so for this we will handle both from here
    if (req.originalUrl.startsWith("/api")) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            stack: err.stack,
            message: err.message,
        });
    }

    return res.status(err.statusCode).render("error", {
        title: "Something went wrong!!",
        message: err.message,
    });

}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    err.name = err.name; // if some error will come it's like type of error

    //sometime error we can handle better like if we pass id whoes formate is wrong 
    //so we can get enough information from this so we can display better.

    //1.Casting Error
    if (process.env.NODE_ENV === "development") {
        ErrorDev(req, res, err);
    }
    else if (process.env.NODE_ENV === "production") {
        let error = Object.assign(err);
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        else if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        else if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        else if (error.name === "JsonWebTokenError") error = handleJWTValidationError(error);
        ErrorProd(req, res, error);
    }
}