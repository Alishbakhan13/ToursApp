const express = require('express');
const {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    addUser,
    UpdateUserData,
    deleteMe,
    getMe,
    addId,
    uploader,
    editImage
} = require('../controllers/userController');

const {
    signUp,
    login,
    passwordReset,
    passwordUpdate,
    tokenVerfication,
    updateCurrentUserPassword,
    protect
} = require('../controllers/authController');

// without dest  will  only stay in memeory
//const uploader = multer({ dest: 'public/img/users' });
//tours
const userRouter = express.Router();

userRouter.route('/signup').post(signUp);
userRouter.route('/login').post(login);
userRouter.route('/passwordreset').post(passwordReset);
userRouter.route('/passwordupdate/:token').patch(passwordUpdate);

userRouter.use(tokenVerfication);
userRouter.patch('/updatecurrentpassword', tokenVerfication, updateCurrentUserPassword);
// single attribute , name of attribute
//userRouter.patch('/updateuser', tokenVerfication, uploader.single('image'), UpdateUserData);
userRouter.patch('/updateuser', tokenVerfication, uploader, editImage, UpdateUserData);
userRouter.delete('/deleteme', tokenVerfication, deleteMe);
userRouter.get('/me', tokenVerfication, addId, getMe);
userRouter.use(protect('admin'));
userRouter
    .route('/')
    .get(getAllUsers)
    .post(addUser);
userRouter
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = userRouter;
