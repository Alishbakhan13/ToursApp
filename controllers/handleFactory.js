const catchAsync = require('./../utils/catchAsync');
const appErros = require('./../utils/appError');
const apiFeatures = require('./../utils/apiFeatures');
exports.deleteOne = Model =>
    catchAsync(async (req, res, next) => {
        const deleted = await Model.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return next(new appErros('id not in  database', 404));
        }
        res.status(204).json({
            status: 'success'
        });
    });
exports.updateOne = Model =>
    catchAsync(async (req, res, next) => {
        const updated = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updated) {
            return next(new appErros('id not in  database', 404));
        }
        res.status(202).json({
            status: 'success',
            data: { updated }
        });
    });
exports.createOne = Model =>
    catchAsync(async (req, res, next) => {
        const Doc = await Model.create(req.body);
        res.status(201).json({
            status: 'success',
            message: { Doc }
        });
    });
exports.getAll = Model =>
    catchAsync(async (req, res, next) => {
        // for  nested review route
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };
        const features = new apiFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .select()
            .pagelimit();
        // finale execution of query
        const data = await features.query;
        //  find().where('duration').equals('easy;);
        res.status(200).json({
            status: 'success',
            results: data.length,
            data: data
        });
    });

exports.getOne = (Model, populateOption) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (populateOption) query = query.populate(populateOption);
        const get = await query;
        if (!get) {
            return next(new appErros('id not in  database', 404));
        }
        res.status(202).json({
            status: 'success',
            data: { get }
        });
    });
