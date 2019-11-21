const express = require('express');
const {
    getOverview,
    getTour,
    getLogin,
    logOut,
    accountSettings,
    getbookings
} = require('../controllers/viewController');
const { createBooking } = require('../controllers/bookingController');
const { tokenVerfication, loggedInUsser } = require('../controllers/authController');

const router = express.Router();
router.get('/account', tokenVerfication, accountSettings);
router.use(loggedInUsser);
router.get('/', createBooking, getOverview);
router.get('/login', getLogin);
router.get('/logout', logOut);
router.get('/logout', logOut);
router.get('/tours/:slug', getTour);
router.get('/bookings', tokenVerfication, getbookings);

module.exports = router;
