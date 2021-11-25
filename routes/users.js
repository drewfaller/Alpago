const express = require('express');
const router = express.Router({mergeParams: true});
const AppError = require('../utilities/AppError');
const User = require('../models/user.js');
const wrapAsync = require('../utilities/wrapAsync');
const { userSchema } = require('../utilities/joiSchemas.js');
const passport = require('passport');
const { isLoggedIn } = require('../middleware')

//Joi validation middleware
const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new AppError(msg, 400)
    } else {
        next();
    }
 } 

//register a new user
router.get('/new', (req, res) => {
    res.render('users/user_register');
})

router.post('', validateUser, wrapAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) {return next(err)};
        });
        req.flash('success', `Fuck you, ${username}!`);
        res.redirect('/users/home');
    } catch(e) {
        console.log(e)
        req.flash('error', e.message);
        res.redirect('/users/new')
    }
 }))

//login user
router.get('/login', (req, res) => {
    res.render('users/user_login');
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', `Welcome back, ${req.user.username}!`);
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

//user DASHBOARD
router.get('/home', isLoggedIn, wrapAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    res.render('users/user_home', user)
}))

//logout
router.get('/logout', isLoggedIn, (req, res, next) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/')
})

//show all users index
router.get('', wrapAsync(async (req, res, next) => {
    const users = await User.find({});
    res.render('users/users_index', { users });
}))

//show a user by id
router.get('/:id', isLoggedIn, wrapAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id).populate('trips');
    if(!user) {
        throw new AppError('User Not Found', 404)
    }
    res.render('users/user_show', user)
}))

//edit my user info
router.get('/:id/edit', isLoggedIn, async(req, res, next) => {
    const user = await User.findById(req.params.id); 
    res.render('users/user_edit', { user });
})

router.put('/:id', isLoggedIn, async(req, res, next) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, {...req.body.campground})
})

module.exports = router;