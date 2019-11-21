const mongoose = require('mongoose');

const schema = mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        require: [true, 'booking must have a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: [true, 'booking must have a user']
    },
    price: {
        type: Number,
        require: [true, 'booking must have a price']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});

// filling   tours and user
schema.pre(/^find/, function(next) {
    this.populate({
        path: 'tour',
        select: '-startLocation  -guides -summary -description'
    }).populate({
        path: 'user',
        select: 'name '
    });
    next();
});

const BookingModel = mongoose.model('Booking', schema);

module.exports = BookingModel;
