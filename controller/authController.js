const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const { promisify } = require('util'); // This is express module to catch promise..
const jwt = require('jsonwebtoken');
// const jwt = require('jsonwebtoken');
const { createJwt } = require('../utils/CreateJwt');
const AppError = require('../utils/appError');

// ...............................................Signup the User..................................................
exports.signUp = catchAsync(async (req, res, next) => {
  const newUSer = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmpassword: req.body.confirmpassword
  });
  // Create JWT Token for user ...
  //   const token = jwt.sign({ id: newUSer._id }, process.env.JWT_SECTRECT, {
  //     expiresIn: process.env.JWT_EXPIRE_DATE
  //   });
  const token = createJwt({ id: newUSer._id });

  //Send the respone back
  res.status(201).json({
    message: 'user is created sucessfully',
    token,
    data: {
      user: newUSer
    }
  });
});

//------------------------------------------------LogIn the user..................................................
exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) First check the password and email
  if (!email || !password) {
    return next(new AppError('Missing password or email', 400));
  }

  // 2)Check if the user exist and password is correct
  const user = await User.findOne({ email }).select('+password'); // we have hide the password in model but we need here so we can get in this way
  // Here user.correctPassword is method that define in user model...
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Inncorrect email or password', 401));
  }
  // 3) Send the response
  const token = createJwt({ id: user._id }); // This is fn to create jwt token pass just current user id.

  res.status(200).json({
    status: 'success',
    token
  });
});

//--------------------------------------- Auth controller  -------------------------------------------------

exports.Auth = catchAsync(async (req, res, next) => {
  // 1) Get the token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Throw error if token is not exist
  console.log(req.headers.authorization, token, '<<<<<<<jwt<<<<<<<<<<<');
  if (!token) {
    return next(new AppError(' Your are not login ', 401));
  }
  // 2) varification the token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRECT);
  // 3) Check the user is still exist

  const freshUser = await User.findById(decode.id.id);
  if (!freshUser) {
    return next(
      new AppError('The user belong to this token is no more exist..', 401)
    );
  }
  // 4) check the user password is changes after the token was issued..
  if (freshUser.changePasswordAt(decode.iat)) {
    return next(
      new AppError('User recetly change the password Please login again..')
    );
  }

  // Grant the access to protected route..
  req.user = freshUser;
  next();
});
