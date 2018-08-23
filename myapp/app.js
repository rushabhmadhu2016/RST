var express = require('express');
var app = express();
var multer = require('multer');
var constants = require('constants');
var constant = require('./config/constants');
/*PortNumber to start*/
//var port = 443;
var port = process.env.PORT || 8084;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var path = require('path');
var fs = require('fs');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var dateFormat = require('dateformat');
var now = new Date();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/***************Mongodb configuratrion********************/
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
//configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

//set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
//app.use(bodyParser()); // get information from html forms

//view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');
app.set('base_url','http://127.0.0.1:8084');
app.use(session({
    secret: 'revstance',
    resave: true,
    saveUninitialized: true   
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./config/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

//launch ======================================================================
/*var key = fs.readFileSync('revstance_private.key');
var cert = fs.readFileSync( 'www_revstance_com.crt' );
var ca = fs.readFileSync('DigiCertCA.crt');
var options = {
  key: key,
  cert: cert,
  ca: ca };
var https = require('https');
https.createServer(options, app).listen(port);*/

app.listen(port);
console.log('The magic happens on port ' + port);

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404).render('404', {title: "Sorry, page not found", session: req.sessionbo});
});

app.use(function (req, res, next) {
    res.status(500).render('404', {title: "Sorry, page not found"});
});

app.locals = {
  version: '0.0.2',
  name: 'Revstance',
  codename: 'Innvonix Technology',
  web: {
    name: 'Revstance',
    logo: 'images/logo.svg',
    url: 'https://revstance.com',
    secure: true,
    divider: ' • '
  },
  meta: {
    keyword: 'Review the world around you!',
    description: 'Revstance is an online platform that allows you to rate and review restaurants, cafes, bars and anything else that has a physical location...',
    author: 'revstance',
  },
  base_url: 'http://127.0.0.1:8084',
  dev: {
    name: 'Developers',
    url: 'https://innvonix.com',
    secure: false,
    errors: '/errors/'
  }
};

exports = module.exports = app;
