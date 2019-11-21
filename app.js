const path = require('path');
const morgan = require('morgan');
const express = require('express');
const rateLimit = require('express-rate-limit');
const mongosanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const tourRouter = require('./routes/tourRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingroutes');
const appErros = require('./utils/appError');
const ErrorHandler = require('./controllers/errorsController');

const app = express();
// rate limit function
const limiter = rateLimit({
    max: 100,
    windowMS: 60 * 60 * 1000,
    message: 'to many request'
});
// ---------------------setting  template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//serving  static files
app.use(express.static(`${__dirname}/public`));
//--------------------------- middleware stack ------------------------

// to set secuirty headers
app.use(helmet());
// to limit number of request from   same IP
app.use('/api', limiter);
//adding middleware  to access req.body
app.use(express.json({ limit: '10kb' }));
// adding cooking to request
app.use(cookieParser());
// query injection
app.use(mongosanitize());
// xss errors
app.use(xss());
// parameter pollution ,  should be used in end as used for query string
app.use(hpp({ whitelist: ['duration', 'maxGroupSize', 'difficulty', 'price', 'ratingsAverage'] }));

// for logging
app.use(morgan('dev'));

//customized
app.use((req, res, next) => {
    req.requestTime = new Date();
    next();
});

//routers
app.use('/', viewRouter);
app.use('/api/v1/tours/', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);
// unhandles routes
app.all('*', (req, res, next) => {
    next(
        // eslint-disable-next-line new-cap
        new appErros(`url not found  ${req.originalUrl} `, 404)
    );
});

//global  error handler
app.use(ErrorHandler);
module.exports = app;
// hello how are you
