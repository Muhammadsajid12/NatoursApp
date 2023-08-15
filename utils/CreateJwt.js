const jwt = require('jsonwebtoken');

// This is custom fn who create jwt token take user id as argument..
const createJwt = id => {
  // Sign is method that take payload as a first parameter,second secret and third optional param expirydate...
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_DATE
  });
};

module.exports = { createJwt };
