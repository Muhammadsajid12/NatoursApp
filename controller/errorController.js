const AppError = require('../utils/appError');

// This fn make operation error that occure from mongodb side..
const handleErrorDb = err => {
  const message = `Invalid${err.path}:${err.value} `;
  return new AppError(message, 400);
};
// This fn create operational error for dupilicate name...
const handleErrorUniqueNameDb = err => {
  const message = `Duplicate field value:${err.keyValue.name} :Please use an other value..`;
  return new AppError(message, 400);
};

// This fn create Validation ......
const handleValidationError = err => {
  const message = `${err.message}`;
  return new AppError(message, 400);
};
// This fn create when your jwt token is wrong
const handleJwtError = err =>
  new AppError('Invalid jwt token , Login again', 401);

// This fn handle expire token error
const handleTokenExpiredError = err =>
  new AppError('Token is expired please login again', 401);

// Error for development....
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
      err
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
    // Error check when user want to create tour with same name...
    if (error.code === 11000) error = handleErrorUniqueNameDb(error);
    //  Error when user miss some required field....
    if (err.name === 'ValidationError') error = handleValidationError(error);
    if (err.name === 'JsonWebTokenError') error = handleJwtError();
    if (err.name === 'TokenExpiredError') error = handleTokenExpiredError();
    errorForProd(error, res);
  }

  next();
};
