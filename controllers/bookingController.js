const stripe = require('stripe')('sk_test_KFEyvv5pIMzNznxE3XV3wKL800MTeA4pR7');
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const appErros = require('./../utils/appError');

exports.getSession = catchAsync(async (req, res, next) => {
    //   1) get tour from id
    const tour = await Tour.findById(req.params.id);
    //   2) create  session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.id}&user=${
            req.user.id
        }&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                amount: 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    });
    // 3) respone to request
    res.status(200).json({
        status: 'success',
        message: { session }
    });
});

module.exports.createBooking = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;
    if (!tour && !user && !price) return next();

    await Booking.create({ tour, user, price });

    //  redirecting it to default root

    res.redirect(req.url.split('?')[0]);
});
