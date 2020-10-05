const express = require('express');
const router = express.Router();
// const router = express.Router({mergeParams: true}); // this is used to access params from the parent route endpoint
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const viewsController = require('../controllers/viewsController');

// router.use(viewsController.alerts);
// /* GET home page. */
// // authController.protect is middleware
// router.get('/', authController.protect, (req, res) =>res.send('hello'));
// router.get('/test', (req, res) =>res.send('test'));

// router.post('/signup', authController.signup);
// router.post('/login', authController.login);

// // Protect all routes after this middleware
// router.use(authController.protect); // this is a middleware, so that after this all the routes are protected(authenticated)

// router.post('/forgotPassword', authController.forgotPassword); //only receive email address
// router.patch('/resetPassword/:token', authController.resetPassword); // receive token as well as new password

// router.patch('/updateMyPaswword', authController.updatePassword);
// router.patch('/updateMe', userController.updateMe);
// router.delete('/deleteMe', userController.deleteMe);
// router.get('/me', userController.getMe, userController.getUser);
// router.post('/createReview', authController.protect, authController.restrictTo('user'), reviewController)
// router.delete('/:id', authController.protect, authController.restrictTo('admin', 'lead'), tourController.deleteTour);
// ^id can be accessed as req.params.id

module.exports = router;
