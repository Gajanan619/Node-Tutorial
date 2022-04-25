class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperationalErr = true // if we manually call this then only this key is true,
        this.stack = Error.captureStackTrace(this);
    }
}

module.exports = AppError
