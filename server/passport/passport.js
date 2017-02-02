var passport = require('passport');

module.exports = function (app) {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, callback) {
        callback(null, user);
    });

    passport.deserializeUser(function (user, callback) {
        callback(null, user);
    });

    require('./local.strategy')();
}