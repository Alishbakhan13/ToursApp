const multer = require('multer');
const sharp = require('sharp');
const tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const appErros = require('./../utils/appError');
const factory = require('./handleFactory');
//getting data from file
/*
const tours = JSON.parse(
  fs.readFileSync(
    `${__dirname}/../dev-data/data/tours.json`
  )
);
*/

// ****************************************functions to handle request ********************

// Tours Functions

/*
exports.checkBody = (req, res, next) => {
     if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'error',
      message: 'missing name  or price '
    });
  }
  next();
};
*/

/*
exports.checkID = (req, res, next, val) => {
 const id = req.params.y * 1;
  console.log(id);
  const tour = tours.find(el => el.id === id);
  console.log(tour);
  if (!tour) {
    //if we dont use return here two response will be send to the client
    return res.status(404).json({
      status: 'fail',
      message: 'wrong id '
    });
  }
  next();

};
*/
// aliase middleware

// middleware  for  photos
//  imagee upload middleware configuration

const multStorage = multer.memoryStorage();
//  images processing with sharp , middleqare
exports.editImage = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();
    //image cover
    if (req.files.imageCover) {
        req.body.imageCover = `tourCover-${req.params.id}-${Date.now()}.jpeg`;
        await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1300)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${req.body.imageCover}`);
    }

    if (req.files.images) {
        req.body.images = [];
        await Promise.all(
            req.files.images.map(async (file, index) => {
                const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
                await sharp(file.buffer)
                    .resize(2000, 1300)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(`public/img/tours/${filename}`);
                req.body.images.push(filename);
            })
        );
    }
    next();
});

// to only allow images
const multFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true);
    else cb(new appErros('only images allowed', 400), false);
};

const upload = multer({ storage: multStorage, fileFilter: multFilter });
exports.uploader = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);

exports.cheapTours = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.filter = 'name,price,ratingsAverage';
    next();
};
exports.getTours = factory.getAll(tour);

exports.addTour = factory.createOne(tour);

exports.getTour = factory.getOne(tour, 'reviews');
exports.updateTour = factory.updateOne(tour);

/*exports.deleteTour = catchAsync(async (req, res, next) => {
    const get = await tour.findByIdAndDelete(req.params.y);
    console.log(1, get);
    if (!get) {
        return next(new appErros('id not in  database', 404));
    }
    res.status(204).json({
        status: 'success'
    });
});
*/
exports.deleteTour = factory.deleteOne(tour);

exports.getStatsTours = catchAsync(async (req, res, next) => {
    let tours = await tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.7 } }
        },
        {
            $group: {
                _id: '$difficulty',
                num: { $sum: 1 },
                avgPrice: { $avg: '$price' },
                avgRating: { $avg: '$ratingsAverage' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        /*   {
                $match: { _id: { $ne: 'easy' } }
            },  */
        {
            $sort: { avgPrice: 1 }
        }
    ]);
    //console.log(tours);
    res.status(202).json({
        status: 'success',
        data: { tours }
    });
});

// to  find busy   months

exports.busyMonths = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const tours = await tour.aggregate([
        { $unwind: '$startDates' },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTours: { $sum: 1 },
                nameTours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: { _id: 0 }
        },
        {
            $sort: { numTours: -1 }
        },
        {
            $limit: 4
        }
    ]);
    res.status(202).json({
        status: 'success',
        data: { tours }
    });
});

exports.nearTours = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;

    // format of  lat and lng

    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    if (!lat || !lng || !distance)
        return next(new appErros('please enter  longitude or lattitude  or distance', 400));

    // lng   should be first
    const places = await tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(202).json({
        status: 'success',
        size: places.length,
        data: { places }
    });
});

module.exports.nearAllDistance = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.00062137 : 0.002;

    if (!lat || !lng)
        return next(new appErros('please enter  longitude or lattitude  or distance', 400));

    // lng   should be first
    const places = await tour.aggregate([
        {
            $geoNear: {
                near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(202).json({
        status: 'success',
        size: places.length,
        data: { places }
    });
});
