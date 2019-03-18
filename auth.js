const passport = require('passport');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const GitHubStrategy = require('passport-github').Strategy;

const config = require('./config');

// Configure GitHub strategy for use by Passport.
passport.use(
  new GitHubStrategy(
    {
      clientID: config.githubClientId,
      clientSecret: config.githubClientSecret,
      callbackURL: `${config.host}/login/github/callback`,
      userAgent: 'nusmods-launchpad',
    },
    (accessToken, refreshToken, profile, cb) => {
      // Ensure only whitelisted GitHub users can log in
      if (!config.githubUsernames.includes(profile.username)) {
        const authError = new Error('Username not recognized');
        authError.status = 403;
        return cb(authError);
      }

      return cb(null, profile);
    },
  ),
);

// Configure Passport authenticated session persistence.
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

module.exports = function auth(app) {
  app.use(
    session({
      secret: config.sessionSecret,
      resave: true,
      saveUninitialized: true,
      store: new FileStore(),
    }),
  );

  // Initialize Passport and restore authentication state, if any, from the
  // session.
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/login/github', passport.authenticate('github'));

  app.get(
    '/login/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/');
    },
  );
};
