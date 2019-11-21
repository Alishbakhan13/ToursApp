const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const appErros = require('./../utils/appError');
const mailSender = require('./../utils/mailer');
// middleware for  token verification , Authentication
module.exports.tokenVerfication = catchAsync(async (req, res, next) => {
    // 1) token is send in the header  and standard is mantained
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
        token = req.headers.authorization.split(' ')[1];
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) next(new appErros(' user not logged in ', 401));

    // 2) verify if token is valid  , if it is then it will proced to next , else  it will catch a error
    const playylod = await jwt.verify(token, process.env.JWT_SECRET);

    // 3)  the token assign to the user  is still a  registed user
    const userPresent = await User.findById(playylod.id);
    if (!userPresent) {
        return next(new appErros('the user assigned  no longer exist', 401));
    }

    // 4 to check  if the password is same  nt changed
    if (userPresent.passwordChangedat(playylod.iat)) {
        return next(new appErros('password changed , log in  again', 401));
    }
    //Grant Access
    req.user = userPresent;
    res.locals.user = userPresent;
    next();
});

// middleware  for Authorization  for restricted routes

module.exports.protect = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role))
            return next(new appErros('Not granted to acces to restructed routes', 403));
        next();
    };
};
const tokenGenerate = id => {
    const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
    return token;
};

const tokenAssign = (res, status, user) => {
    const tokenLogin = tokenGenerate(user._id);
    // sending  in cookie
    let cookieOptions = {
        expires: new Date(Date.now() + process.env.Cookie_Expires * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', tokenLogin, cookieOptions);

    //avoid password from showing  when new document is created
    user.password = undefined;
    res.status(status).json({
        status: 'success',
        token: tokenLogin,
        message: { user }
    });
};

module.exports.loggedInUsser = async (req, res, next) => {
    // 1) token  if valid  , if not  then  no errors

    if (req.cookies.jwt) {
        try {
            const token = req.cookies.jwt;

            // 2) verify if token is valid  , if it is then it will proced to next , else  it will catch a error
            const playylod = await jwt.verify(token, process.env.JWT_SECRET);
            //console.log(playylod);
            // 3)  the token assign to the user  is still a  registed user
            const userPresent = await User.findById(playylod.id);
            //console.log(userPresent);
            if (!userPresent) {
                return next();
            }

            // 4 to check  if the password is same  nt changed
            if (userPresent.passwordChangedat(playylod.iat)) {
                return next();
            }

            // user set to be accesed by the pug template
            res.locals.user = userPresent;

            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

const correctPassword = async function(canPassword, dataPassword) {
    // database password hashed
    return await bcrypt.compare(canPassword, dataPassword);
};

module.exports.signUp = catchAsync(async (req, res, next) => {
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });
    const url = 0;
    try {
        new mailSender(user, url).sendWelcome();
    } catch (err) {
        await User.deleteOne(user._id);
    }
    tokenAssign(res, 201, user);
});

module.exports.login = catchAsync(async (req, res, next) => {
    //es6 obeject  destructing
    const { email, password } = req.body;
    //  1)  email and password present
    if (!email || !password) return next(new appErros(' password and email not  entered', 400));
    // 2) to check  password  and  email valid
    const record = await User.findOne({ email }).select('+password');
    //if password not valid n poassword incorrect
    if (!record || !(await correctPassword(password, record.password))) {
        return next(new appErros('wrong password or email'), 401);
    }

    //  correct  password   so send  token
    tokenAssign(res, 201, record);
});

module.exports.passwordReset = catchAsync(async (req, res, next) => {
    //Geet user based  on posted email
    const userupdate = await User.findOne({ email: req.body.email });
    if (!userupdate) return next(new appErros('email not registered'), 404);
    //gernerate reset token

    const token = userupdate.createPasswordResetToken();
    // saving that  token to database
    await userupdate.save({ validationBeforeSave: false });

    //sending the mail
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${token}`;
    try {
        new mailSender(userupdate, resetUrl).passwordRest();
    } catch (err) {
        userupdate.passwordResetToken = undefined;
        userupdate.passwordResetExpires = undefined;
        await userupdate.save({ validationBeforeSave: false });
        return next(new appErros('error sending email ,try again', 500));
    }
    res.status(200).json({ status: 'success' });
});

module.exports.passwordUpdate = catchAsync(async (req, res, next) => {
    //get user based   on the token
    const token = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    // find the user with this token  and the token is not expired
    const updateUser = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gte: Date.now() }
    });
    if (!updateUser) {
        return next(new appErros('token expired or it doesnt exist', 400));
    }

    // token not expired  then set  updated password

    updateUser.password = req.body.password;
    updateUser.passwordConfirm = req.body.passwordConfirm;
    updateUser.passwordResetToken = undefined;
    updateUser.passwordReset = undefined;
    // want to run validatprs
    await updateUser.save();

    //assgin  new login in token to user
    tokenAssign(res, 200, updateUser);
});

module.exports.updateCurrentUserPassword = catchAsync(async (req, res, next) => {
    // 1) get user from document,  for authentication we use authentication middleware
    const userDoc = await User.findById(req.user._id).select('+password');
    //(userDoc);
    //2 ) user password is correct
    //console.log(req.body.passwordCurrent);
    const condition = userDoc.password === req.body.passwordCurrent;
    if (condition === false) {
        return next(new appErros('password not correct', 404));
    }

    //update password , can use   updadate as our validator n middleware only work on  save()
    userDoc.password = req.body.password;
    userDoc.passwordConfirm = req.body.passwordConfirm;

    await userDoc.save();

    //3) login user   send token
    tokenAssign(res, 200, userDoc);
});
