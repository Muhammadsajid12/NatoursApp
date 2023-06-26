const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcrypt');
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
    default: 'admin'
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    default: 'male'
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
  resetPasswordExpire: Date
});

// Model middleware👌👌
userSchema.pre('save', async function(next) {
  // This fn is only excute when docpassword is modified.📈📈
  if (!this.isModified) return next();

  this.password = await bcrypt.hash(this.password, 12);

  // Delete the confirmpassword field..
  this.confirmpassword = undefined;
  next();
});

//...................... WE can create a custom method on doc then can use where ever we want......................
userSchema.methods.correctPassword = async function(
  candidatePassord,
  userPassword
) {
  // this.password we can not access candidate entered password like this beacuase we select:false so we have to get both when fn is called
  return await bcrypt.compare(candidatePassord, userPassword);
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
