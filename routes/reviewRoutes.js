const express = require('express');
const {
    getReviews,
    getReview,
    addReview,
    delelteReview,
    addTourandUserId,
    updateReview
} = require('../controllers/reviewController');
const { tokenVerfication, protect } = require('../controllers/authController');

const reviewRouter = express.Router({ mergeParams: true });
// everyone should be logged in
reviewRouter.use(tokenVerfication);
reviewRouter
    .route('/')
    .get(getReviews)
    .post(protect('user'), addTourandUserId, addReview);
reviewRouter
    .route('/:id')
    .delete(protect('user', 'admin'), delelteReview)
    .patch(protect('user', 'admin'), updateReview)
    .get(getReview);
module.exports = reviewRouter;
