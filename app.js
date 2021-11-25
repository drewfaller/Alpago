const express = require('express');

const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const AppError = require('./utilities/AppError');
const session = require('express-session');
const sessionConfig = require('./utilities/sessionConfig')
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const methodOverride = require('method-override');

//routing
const users = require('./routes/users.js');
const trips = require('./routes/trips.js');

//database
mongoose.connect('mongodb://localhost:27017/calendar', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
});
mongoose.set('useCreateIndex', true);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected');
});

//define app
const app = express();

//view engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

//method override
app.use(methodOverride('_method'));
//needed to parse request body
app.use(express.urlencoded({ extended: true }));
//serve static assets
app.use(express.static(path.join(__dirname, '/public')));

//session
app.use(session(sessionConfig));

//flash
app.use(flash());

//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//local variables middleware, flash
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//router
app.use('/users', users);
app.use('/trips', trips);

//-----ROUTES-----//

//home page
app.get('/', (req, res) => {
    if(req.isAuthenticated()){
        return res.redirect('/users/home')
    }
    res.render('home');
})

//404 error
app.all('*', (req, res, next) => {
    next(new AppError('Page Not Found', 404))
})

//Generic error handling middleware 
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = "Something went wrong, and I don't know what..."
    res.status(statusCode).render('error', { err });
 })

 //reset port listener
app.listen(3000, () => {
    console.log('Serving on Port 3000');
})