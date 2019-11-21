const Review = require('./../models/reviewModel');
const apiFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const appErros = require('./../utils/appError');
const factory = require('./handleFactory');
// middleware

module.exports.addTourandUserId = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user._id;
    next();
};
module.exports.getReviews = factory.getAll(Review);
module.exports.addReview = factory.createOne(Review);

module.exports.delelteReview = factory.deleteOne(Review);

module.exports.updateReview = factory.updateOne(Review);
module.exports.getReview = factory.getOne(Review);
