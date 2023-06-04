class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error';
    this.isOperational = true;

    // Here we are capuring the error when ever object of this class is created constructure called and this call not add in the stack
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
