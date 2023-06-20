const jwt = require('jsonwebtoken');

const createJwt = id => {
  return jwt.sign({ id }, process.env.JWT_SECRECT, {
    expiresIn: process.env.JWT_EXPIRE_DATE
  });
};

module.exports = { createJwt };
