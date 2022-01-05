var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../Models/UserModel');
var Error = require('../Models/Error')
var express = require('express');
var router = express.Router();
passport.use(new GoogleStrategy({
        clientID: "609305227636-5lp0eotrvf8g52aldfb379ppr3dsmeib.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL: "http://localhost:3000/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        var filter1 = /^([a-zA-Z0-9_\.\-])+\@student.tdtu.edu.vn+$/;
        var filter2 = /^([a-zA-Z0-9_\.\-])+\@tdtu.edu.vn+$/;
        const authId = 'google:' + profile.id;
        User.findOne({ 'authId': authId })
            .then(user => {
                if (user) return done(null, user);
                var Check1 = filter1.test(profile.emails[0].value);
                var Check2 = filter2.test(profile.emails[0].value);

                if (Check1 || Check2) {

                    new User({
                            authId: authId,
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            created: new Date(),
                            avatar: profile.photos[0].value,
                            Class: "XXXXXXX",
                            Faculty: "XXXXXXX",
                            role: 'Student',
                        }).save()
                        .then(user => done(null, user))
                        .catch(err => done(err, null));
                } else {

                    Error.findOne({ 'errorId': '01' })
                        .then(user => {
                            if (user) return done(null, user)
                            else {
                                new Error({
                                        errorId: '01',
                                        message: 'Tài khoản không tồn tại'
                                    }).save()
                                    .then(user => done(null, user))
                                    .catch(err => done(err, null));
                            }
                        })
                }

            })
            .catch(err => {
                if (err) return done(err, null);
            });
    }
));
passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => done(null, user))
        .catch(err => done(err, null));
})
router.get('/google', passport.authenticate('google', {
    scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
}));
router.get('/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' }));

module.exports = router;