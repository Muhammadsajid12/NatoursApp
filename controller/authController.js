const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const { promisify } = require('util'); // This is express module to catch promise..
const jwt = require('jsonwebtoken');
// const jwt = require('jsonwebtoken');
const { createJwt } = require('../utils/CreateJwt');
const sendEmail = require('../utils/sendEmail');
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

  // This is custom fn that take payload and create the jwt tokenbased on that payload..
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
  // 1) Get the  jwt token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Throw error if token is not exist
  if (!token) {
    return next(new AppError(' Your are not login ', 401));
  }
  // 2) varification the token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

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
  // Grant the access to protected route...
  // Here we saving the current user to req for working next on this user..
  req.user = freshUser;
  next();
});

// ------------------------------------- Permission Route ---------------------------------------------------------
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      console.log(req.user.role, '>>>>>>>>>>');
      next();
    } else {
      next(
        new AppError(`You don't have permission to perform this operation`, 403)
      );
    }
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user by posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('No account with that Email', 404));
  }
  // 2) Generate random jwt token

  const resetToken = user.CreatePasswordRestToken();
  // await user.save({ validateBeforeSave: false });

  // 3) Send it to user email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}//api/v1/users/resetPassword/${resetToken}`;

  // Create a custom message
  const message = ` Forget Your Password? Submit a PATCH request with your new password and ComformPassword to:${resetURL} If you don't forget password than ignore this message..`;

  try {
    // Call the sendEmail fn
    await sendEmail({
      email: user.email,
      subject: 'your password token valid for (10 mints only)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'sendEmail sucessfully',
      resetToken
    });
  } catch (error) {
    (user.resetPasswordToken = undefined),
      (user.resetPasswordExpire = undefined);
    // await user.save({ validateBeforeSave: false });
    next(
      new AppError(
        `'There was a error sending the email: try again later!'${error}`,
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success'
  });
});
