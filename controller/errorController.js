const AppError = require('../utils/appError');

// This fn make operation error that occure from mongodb side..
const handleErrorDb = err => {
  const message = `Invalid${err.path}:${err.value} `;
  return new AppError(message, 400);
};
// This fn create operational error for dupilicate name...
const handleErrorUniqueNameDb = err => {
  const message = `Duplicate field value:${err.keyValue.name} Please use an other value..`;
  return new AppError(message, 400);
};
const errorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    errr: err,
    stack: err.stack
  });
};
const errorForProd = (err, res) => {
  if (err.isOperational) {
    // Operational trusted error:send message to client

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Unknown and non operational error and we not want to sen to client..
    res.status(err.statusCode).json({
      status: err.status,
      message: 'Somthing went very wrong',
      error: err
    });
  }
};

//?  This is the Global Fn that excute when ever error occure in the application.........
module.exports = (err, req, res, next) => {
  // Here we just simply checking error code send when create ERROR..
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    errorForDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message; // Here message have to assign sepratly becuase message prop inherit from Error class

    // Error checking that send by mongodb...
    if (err.name === 'CastError') error = handleErrorDb(error);
    if (error.code === 11000) error = handleErrorUniqueNameDb(error);
    errorForProd(error, res);
  }

  next();
};
