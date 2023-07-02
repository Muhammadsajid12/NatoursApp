const User = require('../model/userModel');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const { promisify } = require('util'); // This is express module to catch promise..
const jwt = require('jsonwebtoken');
// const jwt = require('jsonwebtoken');
const { createJwt } = require('../utils/CreateJwt');
const sendEmail = require('../utils/sendEmail');
const AppError = require('../utils/appError');
// Custom response obj
exports.sendResponse = function(res, statusCode, user, message) {
  // 1) Creating jwt token..
  const token = createJwt({ id: user._id });
  // 2)Option object for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE_DATE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') options.secure = true;

  // 3) Cookie.
  res.cookie('jwt', token, options);
  // 4)Remove Fields
  user.password = undefined;
  user.confirmpassword = undefined;
  // 5) Send response.
  return res.status(statusCode).json({
    message,
    token,
    data: {
      user
    }
  });
};

// ...............................................Signup the User..................................................
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmpassword: req.body.confirmpassword
  });
  const savedUser = await newUser.save();
  // Create JWT Token for user ...
  //   const token = jwt.sign({ id: newUSer._id }, process.env.JWT_SECTRECT, {
  //     expiresIn: process.env.JWT_EXPIRE_DATE
  //   });

  // This is custom fn that take payload and create the jwt tokenbased on that payload..

  //Send the respone back
  this.sendResponse(res, 201, savedUser, ' New user created successfully..');
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
  console.log(
    user,
    await user.correctPassword(password, user.password),
    '>>>>>>><<<<<<<<<<'
  );
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Inncorrect email or password', 401));
  }
  // 3) Send the response
  const token = createJwt({ id: user._id }); // This is fn to create jwt token pass just current user id.

  this.sendResponse(res, 200, user, ' User Login successfully..', token);
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
  // 2) varification the token // after verification this will return object with id.....
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
  // Here we saving the current user to req for working next on this user by middleware fn..
  req.user = freshUser;
  next();
});

// ------------------------------------- Permission Route ---------------------------------------------------------
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      next(
        new AppError(`You don't have permission to perform this operation`, 403)
      );
    }
  };
};
// ------------------------------------------ForgetPassword---------------------------------------------------
// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   // 1) Get user by posted email
//   const user = await User.findOne({ email: req.body.email });

//   if (!user) {
//     return next(new AppError('No account with that Email', 404));
//   }
//   // 2) Generate random jwt token

//   const resetToken = user.CreatePasswordRestToken();
//   await user.save({ validateBeforeSave: false });

//   // 3) Send it to user email
//   const resetURL = `${req.protocol}://${req.get(
//     'host'
//   )}//api/v1/users/resetPassword/${resetToken}`;

//   // Create a custom message
//   const message = ` Forget Your Password? Submit a PATCH request with your new password and ComformPassword to:${resetURL}: If you don't forget password than ignore this message..`;

//   try {
//     // Call the sendEmail fn
//     await sendEmail({
//       email: user.email,
//       subject: 'your password token valid for (10 mints only)',
//       message
//     });

//     this.sendResponse(res, 200, user, ' Email send  successfully..');
//   } catch (error) {
//     (user.resetPasswordToken = undefined),
//       (user.resetPasswordExpire = undefined);
//     await user.save({ validateBeforeSave: false });
//     next(
//       new AppError(
//         `'There was a error sending the email: try again later!'${error}`,
//         500
//       )
//     );
//   }
// });

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user by posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('No account with that Email', 404));
  }

  // 2) Generate random jwt token
  const resetToken = user.CreatePasswordRestToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  // Create a custom message
  const message = `Forget Your Password? Submit a PATCH request with your new password and ConfirmPassword to: ${resetURL}. If you didn't forget your password, please ignore this message.`;

  try {
    // Call the sendEmail function
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message
    });

    this.sendResponse(res, 200, user, 'Email sent successfully.');
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Please try again later.',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1)Get user based on token..
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // 2)If token is not expire , there a user , send new password
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });
  console.log(user, '>>><<<<<<<<<<');
  if (!user) return next(new AppError(`Invalid Token Or hased expired.`, 400));
  // Here assiging new user entered password..
  (user.password = req.body.password),
    (user.confirmpassword = req.body.confirmpassword),
    (user.resetPasswordToken = undefined),
    (user.resetPasswordExpire = undefined);
  await user.save(); // Here we saving the user
  // 3)Update the changepasswordAt property for the user
  //Send the respone back
  this.sendResponse(res, 200, user, 'ResetPassword Successgully..');
});
//--------------------------------------- User Update the password------------------------------------
exports.updateThePassword = catchAsync(async (req, res, next) => {
  // 1) Get the current user from collection user store in req object.
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check user current  Posted password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is Wrong', 400));
  }
  // 3) Update the password
  (user.password = req.body.password),
    (user.confirmpassword = req.body.passwordConfirm);

  await user.save();

  // 4) send jwt token
  this.sendResponse(res, 201, user, ' Password update successfully..');
});
