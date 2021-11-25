const express = require('express');
const router = express.Router({mergeParams: true});
const AppError = require('../utilities/AppError');

const Trip = require('../models/trip.js');
const User = require('../models/user.js');
const wrapAsync = require('../utilities/wrapAsync');
const { tripSchema } = require('../utilities/joiSchemas.js');
const { isLoggedIn } = require('../middleware')
const { isCreator } = require('../middleware')

//Joi validation middleware
const validateTrip = (req, res, next) => {
    const { error } = tripSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

// my upcoming trips
router.get('/upcoming', isLoggedIn, wrapAsync(async (req, res, next) => {
    res.render('trips/upcoming_trips');
}))

//show trips index
router.get('', wrapAsync(async (req, res, next) => {
    const trips = await Trip.find({}).populate('creator');
    res.render('trips/trip_index', { trips });
}))

//plan new trip
router.get('/new', isLoggedIn, (req, res, next) => {
    res.render('trips/trip_form');
})

router.post('', isLoggedIn, validateTrip, wrapAsync(async (req, res, next) => {
    const trip = new Trip(req.body);
    const user = await User.findById(req.user._id);
    trip.creator = req.user._id;
    user.trips.push(trip._id);
    await trip.save();
    await user.save();
    req.flash('success', 'New Trip Saved!')
    res.redirect(`/trips/${trip._id}`)
}))

//show trip
router.get('/:id', wrapAsync(async (req, res, next) => {
    const trip = await Trip.findById(req.params.id).populate('creator');
    if(!trip) {
        throw new AppError('Trip Not Found', 404)
    }
    res.render('trips/trip_show', { trip })
}))

//edit a trip
router.get('/:id/edit', isLoggedIn, wrapAsync(async (req,res, next) => {
    const trip = await Trip.findById(req.params.id)
    res.render('trips/trip_edit', { trip });
}))

router.patch('/:id', isLoggedIn, isCreator, validateTrip, wrapAsync(async (req, res, next) => {
    req.flash('success', 'trip updated!');
    res.redirect(`/trips/${trip._id}`);
}))

//delete a trip
router.delete('/:id/users/:userId', isLoggedIn, isCreator, wrapAsync( async (req, res, next) => {
    const { id, userId } = req.params;
    await Trip.findByIdAndDelete(id);
    const user = await User.findByIdAndUpdate(userId, { $pull: { trips: id } });
    req.flash('success', 'a trip was succesfully deleted');
    res.redirect('/trips')
}));

module.exports = router;