const express = require('express');
const ensureLoggedIn = require('connect-ensure-login');

const path = require('path');

const dashboard = require('./routes/dashboard');
const commits = require('./routes/commits');
const auth = require('./auth');

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

auth(app);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', dashboard);
app.use(
  '/commits',
  ensureLoggedIn.ensureLoggedIn('/'),
  (req, res, next) => {
    // Do not allow any actions if there is an ongoing build.
    if (commits.ongoingBuild) {
      res.sendStatus(403);
      return;
    }
    next();
  },
  commits.router,
);

const port = process.env.PORT || 3000;
app.listen(port);

console.log(`Server started on port ${port}`);
