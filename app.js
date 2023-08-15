const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const tourRouter = require('./Route/ToureRoute');
const userRouter = require('./Route/userRoute');
const AppError = require('./utils/appError');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const errorGlobalHandler = require('./controller/errorController');

const app = express();

// Here we getting the enviroment variable data Db Connecting stuff........👻👻👻
const DB = process.env.DATA_BASE.replace(
  '<PASSWORD>',
  process.env.DATA_BASE_PASSWORD
);
// Connecting to database....
mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  // .connect('mongodb://localhost:27017/natours')
  .then(() => {
    // console.log(con.connection);
    console.log('db connected ');
  })
  .catch(err => {
    console.log(`'Error;${err} '`);
    process.exit(1);
  });
// GLOBAL MIDDLEWARE...

// SET HEADERS..
app.use(helmet());
// MONGO SANITIZE
app.use(mongoSanitize());
// XSS
app.use(xss());

const limiter = rateLimit({
  max: 100,
  WindowMs: 60 * 60 * 1000,
  message: ' To many request to this route :Please wait one hour'
});
// LIMITER middleware..
app.use('/api', limiter);
// Here we just checking the enviroment....
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// This middleware is important to use here this will make able to us send data in json formate...........
app.use(express.json({ limit: '10kb' }));
// Serving static files..
app.use(express.static(`${__dirname}/public`)); // this middleware allow to show static files to browser like html

// ROUTES...........😕😕😕
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// This route handle the all unwantedRoute  Requests...
app.all('*', (req, res, next) => {
  // Here passing the error to next that will find global error fn in application and excute...
  next(new AppError(`This route is not found${req.originalUrl}`, 400));
});

// This is Error middleware function excute when ever error occure in application...
app.use(errorGlobalHandler);

module.exports = app;
