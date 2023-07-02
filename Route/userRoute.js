const express = require('express');
const router = express.Router();
const { signUp, logIn } = require('../controller/authController');

const {
  forgotPassword,
  resetPassword,
  updateThePassword,
  Auth
} = require('../controller/authController');
const {
  GetAllUsers,
  GetUser,
  updateMe,
  deleteMe
} = require('../controller/userController');

router.post('/singUp', signUp);
router.post('/logIn', logIn);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updatepassword', Auth, updateThePassword);
router.patch('/update/me', Auth, updateMe);
router.delete('/delete/me', Auth, deleteMe);

// User-Routes
router.get('/', GetAllUsers).post(GetUser);

// router
//   .get('/:id/:x?/:y?', PostUser)
//   .patch('/:id/:x?/:y?', UpdateUser)
//   .delete('/:id/:x?/:y?', DeleteUser);

// Exports..
module.exports = router;
