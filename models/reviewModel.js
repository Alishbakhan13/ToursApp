const mongoose = require('mongoose');
const validator = require('validator');
const Tour = require('./tourModel');
const ReviewSchema = mongoose.Schema({
    review: {
        type: String,
        required: [true, 'review is required']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'review must belong to a  tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'review must be by a User']
    }
});
// for  avoiding duplicate reviews
ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });

ReviewSchema.pre(/^find/, function(next) {
    /*
    this.populate({
        path: 'tour',
        select: 'name'
    }).populate({
        path: 'user',
        select: 'name photo'
    });
    */
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

ReviewSchema.statics.calAvergRating = async function(tourId) {
    const stats = await this.aggregate([
        { $match: { tour: tourId } },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

ReviewSchema.post('save', function() {
    this.constructor.calAvergRating(this.tour);
});

// Query middleware has access only to qury
// for  findbyIdandDelete and FindByIdandUpdate  both  use findOne
ReviewSchema.pre(/^findOneAnd/, async function(next) {
    //  we have acccess to query not document
    this.doc = await this.findOne();
    next();
});

ReviewSchema.post(/^findOneAnd/, function() {
    this.doc.constructor.calAvergRating(this.doc.tour);
});
const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
