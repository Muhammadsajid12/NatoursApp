const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./Route/ToureRoute');
const userRouter = require('./Route/userRoute');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// This middleware is important to use here this will makeable to us send data in json formate...........
app.use(express.json());

app.use(express.static(`${__dirname}/public`)); // this middleware allow to show static files to browser like html

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);

module.exports = app;
