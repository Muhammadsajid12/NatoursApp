const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const tourRouter = require('./Route/ToureRoute');
const userRouter = require('./Route/userRoute');

const app = express();

// Here we getting the enviroment variable data Db Connecting stuff........👻👻👻
const DB = process.env.DATA_BASE.replace(
  '<PASSWORD>',
  process.env.DATA_BASE_PASSWORD
);
mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  // .connect('mongodb://localhost:27017/natours')
  .then(con => {
    // console.log(con.connection);
    console.log('db connected ');
  })
  .catch(err => console.log(err));

// Here we just checking the enviroment....
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// This middleware is important to use here this will makeable to us send data in json formate...........
app.use(express.json());

app.use(express.static(`${__dirname}/public`)); // this middleware allow to show static files to browser like html

// ROUTES...........😕😕😕
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);

module.exports = app;
