const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/calendar', {useNewUrlParser: true, useUnifiedTopology: true})

const TripSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Trip Needs a Name'] 
    },
    time: Number,
    distance: Number,
    elevation: Number,
    season: Array,
    map: String,
    notes: String,
    link1: String,
    link2: String,
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
})

const Trip = mongoose.model('Trip', TripSchema)

module.exports = Trip;