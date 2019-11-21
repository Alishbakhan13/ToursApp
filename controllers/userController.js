const jwt = require('jsonwebtoken');
const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const appErros = require('./../utils/appError');
const factory = require('./handleFactory');
//  users functions
exports.addId = (req, res, next) => {
    req.params.id = req.user._id;
    next();
};
const filterUpdate = (object, ...Fields) => {
    let update = {};

    Fields.forEach(item => {
        if (object[item]) {
            update[item] = object[item];
        }
    });
    return update;
};

//  imagee upload middleware configuration

//  if  images r save as it is
/*
const multStorage = multer.diskStorage({
    // cb is like next and file is req.file
    destination: (req, file, cb) => {
        cb(null, 'public/img/users');
    },
    filename: (req, file, cb) => {
        const extention = file.mimetype.split('/')[1];
        // saving as  user-id-timestamp.format to prevent   duplicate name
        cb(null, `user-${req.user.id}-${Date.now()}.${extention}`);
    }
}); */

//  if images are to be edited
const multStorage = multer.memoryStorage();
//  images processing with sharp , middleqare
exports.editImage = async (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);
    next();
};

// to only allow images
const multFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true);
    else cb(new appErros('only images allowed', 400), false);
};

const upload = multer({ storage: multStorage, fileFilter: multFilter });
exports.uploader = upload.single('photo');
// Controller functions
module.exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);
exports.getMe = factory.getOne(User);
exports.addUser = factory.createOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.UpdateUserData = catchAsync(async (req, res, next) => {
    //   by multer parser , form data avaliable on  req.file
    /// console.log(req.file);
    // if password present    send error
    if (req.body.password || req.body.passwordConfirm) {
        return next(new appErros('password cant be changed', 400));
    }
    //update User
    const data = filterUpdate(req.body, 'name', 'email', 'image');
    data.photo = req.file.filename;
    const updateUser = await User.findByIdAndUpdate(req.user._id, data, {
        new: true,
        runValidators: true
    });
    console.log(updateUser);
    //filter the updating fields only
    res.status(201).json({
        status: 'success',
        message: { user: updateUser }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    // get  user  and update active field
    await User.findByIdAndUpdate(req.user._id, { active: false });
    res.status(204).json({
        status: 'sucess',
        message: null
    });
});
