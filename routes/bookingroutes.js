const express = require('express');
const { getSession } = require('../controllers/bookingController');
const { tokenVerfication, protect } = require('../controllers/authController');

const bookingRouter = express.Router();
// everyone should be logged in
bookingRouter.use(tokenVerfication);
bookingRouter.route('/checkout_session/:id').get(getSession);

module.exports = bookingRouter;
