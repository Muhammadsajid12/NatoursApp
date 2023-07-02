const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../controller/authController');
const AppError = require('../utils/appError');

// Custom fn filter the body
const filteredObj = (obj, ...allowFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};
//------------------------------------- Get user Update ----------------------------------------------------------
const GetAllUsers = catchAsync(async (req, res, next) => {
  const allUser = await User.find();

  res.status(200).json({
    status: 'success',
    message: 'The data is found',
    data: allUser
  });
});
//---------------------------------- Update the current login user data ---------------------------------------
const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmpassword) {
    return next(
      new AppError(
        'This route is not for update the user password :Please use /updatepassword route',
        400
      )
    );
  }
  // 2) Filtered the user fields which is not allow to update..
  const filteredBody = filteredObj(req.body, 'name', 'email');
  // 3) update user document...
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  sendResponse(res, 200, updatedUser, 'User data updated successfully');
});
const deleteMe = catchAsync(async (req, res, next) => {
  // 1) update the user active field
  await User.findByIdAndUpdate(req.user.id, { active: false });
  sendResponse(res, 204, 'User delete successfully');
});

const GetUser = (req, res) => {
  res.status(500).json('The data is not found');
};
const PostUser = (req, res) => {
  res.status(500).json('The data is not found');
};
const UpdateUser = (req, res) => {
  res.status(500).json('The data is not found');
};
const DeleteUser = (req, res) => {
  res.status(500).json('The data is not found');
};

module.exports = {
  GetAllUsers,
  GetUser,
  PostUser,
  UpdateUser,
  DeleteUser,
  updateMe,
  deleteMe
};
