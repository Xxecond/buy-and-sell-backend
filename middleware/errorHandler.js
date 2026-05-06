const { ZodError } = require("zod");

const errorHandler = (err, req, res, next) =>{
    console.error(err);

    let statusCode = err.status || 500;
    let message = err.message || "something went wrong";

    if(err instanceof ZodError) {
        statusCode = 400;
        message = err.issues.map(e => e.message).join(", ");
    }

    res.status(statusCode).json({
        error: message
    });
}

module.exports = errorHandler;