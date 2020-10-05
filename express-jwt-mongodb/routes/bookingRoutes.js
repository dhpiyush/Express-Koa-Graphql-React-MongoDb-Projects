const express = require('express');
const router = express.Router();
// const router = express.Router({mergeParams: true}); // this is used to access params from the parent route endpoint
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

// router.use(authController.protect);
// /* GET home page. */
// // authController.protect is middleware
// router.get('/checkout-session/:userId', bookingController.getCheckoutSession);

// router.use(authController.restrictTo('admin', 'lead-guide'));

// router.get('/', bookingController.getAllBookings)
// router.post('/',bookingController.createBooking);

// router.get('/:id',bookingController.getBooking)
// router.patch('/:id',bookingController.updateBooking)
// router.delete('/:id',bookingController.deleteBooking)

module.exports = router;
