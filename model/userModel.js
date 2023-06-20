const mongoose = require('mongoose');
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
  }
});

// Model middleware👌👌
userSchema.pre('save', async function(next) {
  // This fn is only excute when docpassword is modified.📈📈
  if (!this.isModified) return next();

  this.password = await bcrypt.hash(this.password, 12);

  // Delete the confirmpassword field..
  this.confirmpassword = undefined;
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

    return jwtTimeStamp < changeTimeStamp; // 100 < 200
  }
  return false;
};

//Here create the model
const User = mongoose.model('User', userSchema);

module.exports = User;
