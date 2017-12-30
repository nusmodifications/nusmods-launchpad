const express = require('express');
const passport = require('passport');
const Strategy = require('passport-facebook').Strategy;
const config = require('./config');

const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

const router = express.Router();
const nodegit = require('nodegit');

const dashboard = require('./routes/dashboard');
const commits = require('./routes/commits');

const LATEST_COMMITS = 200;
const COMMIT_HASH_FILE = 'commit-hash.txt';

// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
    clientID: config.facebookAppID,
    clientSecret: config.facebookAppSecret,
    callbackURL: `${config.host}/login/facebook/return`,
  }, (accessToken, refreshToken, profile, cb) => {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});


// Create a new Express application.
const app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.get('/login/facebook', passport.authenticate('facebook'));

app.get('/login/facebook/return',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  });

app.use('/',
  dashboard);
app.use('/commits',
  require('connect-ensure-login').ensureLoggedIn('/'),
  (req, res, next) => {
    // Do not allow any actions if there is an ongoing build.
    if (commits.ongoingBuild) {
      res.sendStatus(403);
      return;
    }
    next();
  },
  commits.router);

app.listen(3000);
