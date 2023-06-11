const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signUp = catchAsync(async (req, res, next) => {
  const newUSer = await User.create(req.body);

  //Send the respone back
  res.status(201).json({
    message: 'user is created sucessfully',
    data: {
      user: newUSer
    }
  });
});
