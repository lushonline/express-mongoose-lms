const express = require('express');
const path = require('path');
const logger = require('morgan');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const httpStatus = require('http-status');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');

const config = require('./config');
const APPError = require('../server/helpers/AppError');

const models = require('../models');

const { home, login, player, logout, library, hacp, register } = require('../server/routes');

const app = express();

if (config.env === 'development') {
  app.use(logger('dev'));
}

// parse body params and attache them to req.body
app.use(bodyParser.json());

app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

app.use(
  require('express-session')({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
  }),
);

app.set('views', path.join(__dirname, '../server/views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));

// Initialize Passport and restore authentication state, if any, = require( the
// session.
app.use(passport.initialize());
app.use(passport.session());

passport.use(models.User.createStrategy());
passport.serializeUser(models.User.serializeUser());
passport.deserializeUser(models.User.deserializeUser());

app.use('/', home);
app.use('/login', bodyParser.urlencoded({ extended: true }), login);
app.use('/player', player);
app.use('/logout', logout);
app.use('/library', library);
app.use('/hacp', hacp);
app.use('/register', register);

// if error is not an instanceOf APPError, convert it.
app.use((err, req, res, next) => {
  if (!(err instanceof APPError)) {
    const apiError = new APPError(err.message, err.status, err.isPublic);
    return next(apiError);
  }
  return next(err);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new APPError('not found', httpStatus.NOT_FOUND);
  return next(err);
});

// error handler, send stacktrace only during development
app.use(
  (
    err,
    req,
    res,
    next, // eslint-disable-line no-unused-vars
  ) =>
    res.status(err.status).json({
      message: err.isPublic ? err.message : httpStatus[err.status],
      stack: config.env === 'development' ? err.stack : {},
    }),
);

module.exports = app;
