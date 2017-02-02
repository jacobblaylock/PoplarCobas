var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy

const users = [
    { "username": "jacob", "password": "jpass" },
    { "username": "cam", "password": "cpass" },
    { "username": "birdie", "password": "birdpass" },
    { "username": "buzz", "password": "beepass" }
]

var local = function () {
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
        function (username, password, callback) {
            var user = users.find(u => u.username === username);
            if (!user) {
                callback(null, false, { message: 'User not found' })
            }
            if (user) {
                if (user.password === password) {
                    callback(null, user, {message: 'Authenticated'})
                } else {
                    callback(null, false, { message: 'Invalid password' })
                }
            }
        }))
}

module.exports = local;