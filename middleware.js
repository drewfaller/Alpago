const Trip = require("./models/trip");

module.exports.isLoggedIn = (req, res, next) => {
if(!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be logged in to do that.');
    return res.redirect('/users/login');
}
next();
} 

module.exports.isCreator = async (req, res, next) => {
    const { id } = req.params;
    const trip = await Trip.findById(id);
    if(!trip.creator.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds${id}`);
    }
    next();
}