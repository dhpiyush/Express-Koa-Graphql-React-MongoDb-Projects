const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const {AppError} = require('../utils');
const factory = require('./handlerFactory'); 

const config = require('config');
const stripeSecret = config.get('stripe-secret-key')
const stripe = require('stripe')(stripeSecret);


exports.getCheckoutSession = catchAsync(async(req, res, next) => {

    const user = await User.findById(req.params.userId);

    //create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?alert=booking`,
        cancel_url: `${req.protocol}://${req.get('host')}/`,
        customer_email: req.user.email,
        client_reference_id: req.params.userId,
        line_items: [
            {
                name: `${user.name}`,
                desciption: 'Please make payment',
                images: [`${req.protocol}://${req.get('host')}/img/tours/${user.image}`],
                amount: 1,
                currency: 'usd',
                quantity: 1
            }
        ]
    });

    res.status(200).json({
        status: 'success',
        session
    })
});

const createBookingCheckout = async session =>{

    const user = (await User.findOne({email: session.customer_email})).id;
    const price = session.line_items[0].amount / 100;
    //create an enttry in our db
    await Booking.create({user, price});
};

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    const stripeWebhookSecret = config.get('stripe-webhook-secret');
    try {
        event = stripe.webhooks.contructEvent(
            req.body,
            signature,
            stripeWebhookSecret
        );
    } catch (error) {
        return res.status(400).send(`Webhook error: ${error.message}`)
    }

    if (event.type === 'checkout.session.completed') {
        createBookingCheckout(event.data.object);
    }

    res.status(200).json({received: true});
}
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
