const express = require('express');
const router = express.Router();
const { signUp, logIn } = require('../controller/authController');

const {
  forgotPassword,
  resetPassword,
  hello
} = require('../controller/authController');
const { GetAllUsers, GetUser } = require('../controller/userController');

router.post('/singUp', signUp);
router.post('/logIn', logIn);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword:token', resetPassword);

// User-Routes
// router.get('/', GetAllUsers).post(GetUser);

// router
//   .get('/:id/:x?/:y?', PostUser)
//   .patch('/:id/:x?/:y?', UpdateUser)
//   .delete('/:id/:x?/:y?', DeleteUser);

// Exports..
module.exports = router;
