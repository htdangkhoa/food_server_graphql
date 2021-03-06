import { isEmail } from 'validator';
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const saltRounds = 10;

const User = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    auto: true,
  },
  email: {
    type: Schema.Types.String,
    lowercase: true,
    trim: true,
    required: true,
    unique: true,
    validate: [isEmail, 'Invalid email.'],
  },
  fullname: {
    type: Schema.Types.String,
    required: true,
  },
  password: {
    type: Schema.Types.String,
    required: true,
  },
}, {
  timestamps: true,
});

User.pre('save', function (next) {
  const user = this;

  if (!user.isModified('password')) {
    return next();
  }

  return bcrypt.genSalt(saltRounds, (error, salt) => {
    if (error) return next(error);

    return bcrypt.hash(user.password, salt, (e, hash) => {
      if (e) return next(e);

      user.password = hash;
      return next();
    });
  });
});

User.methods.comparePassword = function (password, next) {
  bcrypt.compare(password, this.password, (error, isMatch) => {
    if (error) return next(error);

    return next(null, isMatch);
  });
};

export default mongoose.model('user', User);
