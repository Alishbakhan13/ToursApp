const appErros = require('./../utils/appError');

const devError = (error, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
            stack: error.stack,
            error: error
        });
    } else {
        return res.status(error.statusCode).render('error', {
            title: 'Something went wrong',
            msg: error.message
        });
    }
};

const prodError = (error, req, res) => {
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    } else {
        res.status(500).json({
            status: error,
            message: 'Error has  occured '
        });
    }
};

const jwtErrorInvalid = () => new appErros('invalid token please login again', 401);

const jwtErrorExpired = () => new appErros('token expired  please login again', 401);

const handler = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        devError(error, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        if (error.name === 'JsonWebTokenError') error = jwtErrorInvalid();
        if (error.name === 'TokenExpiredError') error = jwtErrorExpired();
        prodError(error, req, res);
    }
};

module.exports = handler;
