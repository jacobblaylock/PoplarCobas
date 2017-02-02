var express = require('express');
var router = express.Router();
var passport = require('passport');

router.post('/signIn', function (req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if(err) {
            console.log('error at passport.authenticate');
            return next(err);
        }
        if(!user) {
            return res.send({user: user, status: info.message});
        }
        req.logIn(user, function(err){
            if(err) {
                console.log('error at req.logIn');
                return next(err);
            }
            return res.send({user: user, status: info.message});
        })
    })(req, res, next);
});

module.exports = router;