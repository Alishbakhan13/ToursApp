const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const appErros = require('./../utils/appError');
const Booking = require('./../models/bookingModel');
module.exports.getOverview = catchAsync(async (req, res) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'Natours | Exciting tours for adventurous people',
        tours
    });
});

module.exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'rating user review'
    });
    if (!tour) {
        return next(new appErros('no tour exist with this name', 404));
    }
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour: tour
    });
});

module.exports.getLogin = (req, res) => {
    res.status(200).render('login', { title: 'login into your account' });
};

module.exports.logOut = (req, res) => {
    res.cookie('jwt', 'logged Out', {
        expires: new Date(Date.now() + 10 * 1000)
    });

    res.status(200).json({
        status: 'success'
    });
};

module.exports.accountSettings = (req, res, next) => {
    res.status(200).render('account', {
        title: 'Your Account'
    });
};

module.exports.getbookings = catchAsync(async (req, res, next) => {
    // get booking
    const bookings = await Booking.find({ user: req.user.id });
    //  tours already populated
    const tour = bookings.map(e => e.tour);
    console.log(tour);

    res.status(200).render('overview', {
        title: 'Natours | Exciting tours for adventurous people',
        tours: tour
    });
});
