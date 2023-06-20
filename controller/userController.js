const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');

const GetAllUsers = catchAsync(async (req, res, next) => {
  const allUser = await User.find();

  res.status(200).json({
    status: 'success',
    message: 'The data is not found',
    data: allUser
  });
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
  DeleteUser
};
