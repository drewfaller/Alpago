const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost:27017/calendar', { useNewUrlParser: true, useUnifiedTopology: true })

const userSchema = new Schema({
    email: {
        type: String,
        unique: false,
    },
    trips: [
        {
            type: Schema.Types.ObjectId, 
            ref: 'Trip',
        }]
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

module.exports = User;