const { Schema, model } = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const { isEmail, isStrongPassword } = require('validator');
const { InvalidPasswordError } = require('../lib/errors');

// Just add the extra fields we want - passport-local-mongoose will add usernamne/password etc
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    familyName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      validate: [isEmail],
    },
    active: {
      type: Boolean,
    },
  },
  { timestamps: true },
);

// Virtual for AICC student_name
userSchema.virtual('student_name').get(() => {
  return `${this.familyName}, ${this.firstName}`;
});

// Virtual for AICC student_id
userSchema.virtual('student_id').get(() => {
  // eslint-disable-next-line no-underscore-dangle
  return this._id;
});

userSchema.methods.toJSON = () => {
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
};

const passwordValidator = (password, cb) => {
  if (!isStrongPassword(password)) {
    return cb(new InvalidPasswordError('The password does not meet the minimum requirements'));
  }
  // return an empty cb() on success
  return cb();
};

// Setting up the passport plugin
userSchema.plugin(passportLocalMongoose, {
  limitAttempts: true,
  usernameLowerCase: true,
  passwordValidator,
});

const User = model('User', userSchema);

module.exports = User;
