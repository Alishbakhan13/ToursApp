const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./../models/userModel');
//creating scheme
const tourSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'there cant be a  tour without a name'],
            unique: [true, 'name should nt be repeated'],
            trim: true
        },
        duration: {
            type: String,
            required: [true, 'duration is a must']
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'incomplete without group size']
        },
        slug: String,
        difficulty: {
            type: String,
            reuqire: [true, 'a tour must have  difficulty']
        },
        priceDiscount: Number,
        summary: { type: String, trim: true },
        imageCover: String,
        images: [String],
        createdAt: { type: Date, default: Date.now() },
        ratingsAverage: { type: Number, defualt: 4.5, set: val => Math.round(val * 10) / 10 },
        ratingsQuantity: { type: Number, defualt: 0.0 },
        price: {
            type: Number,
            required: [true, 'number is required']
        },
        secretTour: {
            type: Boolean,
            default: false
        },
        startDates: [Date],
        description: String,
        startLocation: {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point']
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number
            }
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }
        ]
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeek').get(function() {
    return this.duration / 7;
});
tourSchema.virtual('reviews', { ref: 'Review', foreignField: 'tour', localField: '_id' });

//middle ware
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

tourSchema.pre(/^find/, function(next) {
    this.populate({ path: 'guides', select: '-__v  -passwordChangedAt' });
    next();
});
tourSchema.pre('save', function(next) {
    console.log(this);
    next();
});
// for embedding guides in  tour schema
/*tourSchema.pre('save', async function(next) {
    const guidePromises = this.guides.map(el => User.findById(el));
    this.guides = await Promise.all(guidePromises);
    next();
}); */

tourSchema.post('save', function(doc, next) {
    // console.log(doc);
    next();
});

// query middleare
//to  include all kinds of find functions
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });
    this.date = Date.now();
    next();
});

/*
tourSchema.post(/^find/, function(doc, next) {
    console.log(
        `time to execurion ${this.date -
            Date.now()} milliseconds`
    );
 //   console.log(doc);
    next();
});
*/
tourSchema.pre('aggregate', function(next) {
    //   this.pipeline().unshift({
    //      $match: { secretTour: { $ne: true } }
    //   });
    next();
});
//to create model ..
const Tour = mongoose.model('Tour', tourSchema);

// to create  document
/*
const testTour = new Tour({
    name: 'sea-veiw',
    price: 200
});
testTour
.save()
.then(doc => console.log(doc))
.catch(err => console.log('error', err));
})
*/
module.exports = Tour;
