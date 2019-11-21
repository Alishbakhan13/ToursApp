const express = require('express');
const {
    getTours,
    getTour,
    updateTour,
    deleteTour,
    addTour,
    cheapTours,
    getStatsTours,
    busyMonths,
    nearTours,
    nearAllDistance,
    uploader,
    editImage
    //checkID,
    //checkBody
} = require('../controllers/tourController');
const { tokenVerfication, protect } = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
//tours
const tourRouters = express.Router();
// for nested route  of writing a  review on a  already selected  tour
tourRouters.use('/:tourId/reviews', reviewRouter);
tourRouters.route('/cheap-tours').get(cheapTours, getTours);

tourRouters.route('/aggregation-results').get(getStatsTours);
tourRouters.route('/tours-distance/:distance/center/:latlng/unit/:unit').get(nearTours);
tourRouters.route('/distance/:latlng/unit/:unit').get(nearAllDistance);
tourRouters
    .route('/bussiness-problems/:year')
    .get(tokenVerfication, protect('admin', 'lead-guide', 'guide'), busyMonths);

//tourRouters.param('y', checkID);
tourRouters
    .route('/')
    .get(getTours)
    //.post(checkBody, addTour);
    .post(tokenVerfication, protect('admin', 'lead-guide'), addTour);
tourRouters
    .route('/:id')
    .get(getTour)
    .patch(tokenVerfication, protect('admin', 'lead-guide'), uploader, editImage, updateTour)
    .delete(tokenVerfication, protect('admin', 'guide-lead'), deleteTour);

// aliasing

module.exports = tourRouters;
