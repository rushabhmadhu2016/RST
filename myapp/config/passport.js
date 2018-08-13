var LocalStrategy   = require('passport-local').Strategy;
var User            = require('../app/models/user');
var Like            = require('../app/models/like');
var FlaggedReview   = require('../app/models/flagged_review');
var Business        = require('../app/models/business');
var bcrypt          = require('bcrypt-nodejs');
var configAuth      = require('./auth.js');
var constant        = require('../config/constants');
var dateFormat      = require('dateformat');
var fs              = require('fs');
var bcrypt          = require('bcrypt-nodejs');

//expose this function to our app using module.exports
module.exports = function(passport) {

   passport.serializeUser(function(user, done) {
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // === LOCAL SIGNUP =

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'mail' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);
            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('error', 'This email address already exists.'));
            } else {
                
                
           User.find().sort([['id', 'descending']]).limit(1).exec(function(err, userdata) { 
                // if there is no user with that email
                // create the user
                var newUser = new User();
                // set the user's local credentials                
              //var day =dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss");
              var day = getDate();             
              var active_code=bcrypt.hashSync(Math.floor((Math.random() * 99999999) *54), null, null);                    
                    newUser.first_name = req.body.first_name;
                    newUser.last_name = req.body.last_name;
                    newUser.mail    = email;
                    newUser.password = newUser.generateHash(password);
                    newUser.contact_number = req.body.contact_number;
                    newUser.user_type = req.body.user_type;
                    newUser.status = 0;
                    if(req.body.user_type==2){
                        newUser.address1 = req.body.address1;
                        newUser.address2 = req.body.address2;
                        newUser.city = '';
                        newUser.country = '';
                        newUser.postcode = req.body.business_postcode;
                        newUser.contact_number = req.body.business_contact;
                        newUser.business_name = req.body.business_name;
                    }else{
                        newUser.address1 = '';
                        newUser.address2 = '';
                        newUser.city = '';
                        newUser.country = '';
                        newUser.postcode = '';
                        newUser.contact_number = '';
                        newUser.business_name = '';
                    }
                    newUser.ip_address = req.ip;
                    newUser.created_date = day;
                    newUser.updated_date = day;
                    newUser.active_hash = active_code;
                    if(userdata.length>0){                        
                        newUser.id = userdata[0].id+1;                    
                    }else{
                        newUser.id = 1;
                    }
                    newUser.save(function(err) {
                    if (err){
                        req.flash('User registration failed');
                        res.redirect('/errorpage');
                    }                  
                    var email            = require('../lib/email.js');
                    email.activate_email(req.body.user_type,req.body.first_name,req.body.email,active_code);
                    return done(null, newUser,req.flash('success', 'Account created successfully, please check your email for account confirmation.'));                    
                    req.session.destroy();                
                });                
              });
            }
        });
    });        
}));

    
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form
     User.findOne({ 'mail' :  email }, function(err, user) {
            if (err)
            return done(null, false, req.flash('error', err)); // req.flash is the way to set flashdata using connect-flash

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('error', 'These credentials do not match our records.')); // req.flash is the way to set flashdata using connect-flash          
            
            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('error', 'These credentials do not match our records.')); // create the loginMessage and save it to session as flashdata

            if(user.status === 0)
             return done(null, false, req.flash('error', 'Your account not activated, please check your email'));

             if(user.status === 3)
             return done(null, false, req.flash('error', 'Your account is suspended'));
             /* Get User Flags and Likes*/
            var likedReviews = [];
            var flagedReviews = [];
            Like.find({user_id:user.id}, function(err, likes) {
                if(err){
                    console.log("password Login successful Find Liked Reviews Error");
                    res.send('errorpage');
                }
                likes.forEach(function(like){
                    likedReviews.push(like.review_id);
                });
                FlaggedReview.find({user_id:user.id}, function(err, freviews) {
                    if(err){
                        console.log("password Login successful Find Liked Reviews Error");
                        res.send('errorpage');
                    }
                    freviews.forEach(function(reviews){
                        flagedReviews.push(reviews.review_id);
                    });
                    if(req.body.ip_address){
                        req.session.ip_address = req.body.ip_address;
                    }else{
                        req.session.ip_address = '127.0.0.1';
                    }
                    if(req.body.country){
                        req.session.country = req.body.country;
                    }else{
                        req.session.country = 'India';
                    }
                    req.session.user = user;
                    req.session.likedReviews = likedReviews;
                    req.session.flagedReviews = flagedReviews;
                    req.flash('error','Login done');
                    return done(null, user);
                });
            });
            /* Get User Flags and Likes*/  
        });
    }));


    /*Admin Login*/
    passport.use('admin-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form
        User.findOne({ 'mail' :  email,'user_type' : 3}, function(err, user) {
            if (err)
            return done(null, false, req.flash('error', err)); // req.flash is the way to set flashdata using connect-flash
            if (!user)
                return done(null, false, req.flash('error', 'These credentials do not match our records.')); // req.flash is the way to set flashdata using connect-flash
            if (!user.validPassword(password))
                return done(null, false, req.flash('error', 'These credentials do not match our records.')); // create the loginMessage and save it to session as flashdata
            req.session.user = user;        
            return done(null, user);
        });
    }));
};

function getDate(){ var d = new Date(); return d.getFullYear()+ '-'+addZero(d.getMonth()+1)+'-'+addZero(d.getDate())+' '+addZero(d.getHours())+':'+addZero(d.getMinutes())+':'+addZero(d.getSeconds()); } 

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }

    
    





