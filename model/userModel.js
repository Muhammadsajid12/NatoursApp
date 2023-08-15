const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');
// Here we create the instance of the Schma class
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the name ']
  },
  email: {
    type: String,
    required: [true, 'Please provide the email'],
    validate: [validator.isEmail, 'Please provide valid email'],
    unique: true,
    lowerCase: true
  },
  photo: String,

  role: {
    type: String,
    enum: ['admin', 'user', 'lead-admin'],
    default: 'user'
  },

  password: {
    type: String,
    required: [true, 'Plese provide the password'],
    minlength: [10, 'Password should be at least 10 characters long'],
    select: false
  },
  confirmpassword: {
    type: String,
    required: [true, 'Please provide the confirmEmail '],

    // This validator only work on Save and Create....
    validate: {
      validator: function(el) {
        return el === this.password; // abc=abc
      },
      message: 'password are not the same'
    }
  },
  passwordChangeAt: {
    type: Date,
    default: Date.now()
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// Model middleware👌👌
userSchema.pre(/^find/, async function(next) {
  // filter the user form database..
  this.find({ active: { $ne: false } });
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.isNew) return next();

  if (!this.password) {
    // Handle the case where password is not provided
    // You can throw an error or handle it based on your requirements
    return next(new AppError('Password is required', 400));
  }

  try {
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmpassword = undefined;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  // Here we updating the time of passwordChangeAt Property..
  this.changePasswordAt = Date.now() - 1000;
  next();
});
//...................... WE can create a custom method on doc then can use where ever we want......................
userSchema.methods.correctPassword = async function(
  candidatePassord,
  userPassword
) {
  console.log('<<<<<<<<<<<correctPassword<<<<<<<<<<<<');
  // this.password we can not access candidate entered password like this beacuase we select:false so we have to get both when fn is called
  return await bcrypt.compare(candidatePassord, userPassword);
  // return candidatePassord === userPassword;
};

// User change password after jwt(signup) this fn will return true otherwise return false..
userSchema.methods.changePasswordAt = function(jwtTimeStamp) {
  if (this.passwordChangeAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );

    return jwtTimeStamp < changeTimeStamp; // 100 < 200 If the change time is greater its mean password have changed..
  }
  return false;
};

// This fn create reset random token..🫥🫥
userSchema.methods.CreatePasswordRestToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hash = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordToken = hash;

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

//Here create the model
const User = mongoose.model('User', userSchema);

module.exports = User;
