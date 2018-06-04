import { isEmail } from 'validator'
import mongoose, { Schema } from 'mongoose'

const User = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    auto: true
  },
  email: {
    type: Schema.Types.String,
    lowercase: true,
    trim: true,
    required: true,
    unique: true,
    validate: [isEmail, `Invalid email.`]
  },
  password: {
    type: Schema.Types.String,
    required: true
  }
}, {
  timestamps: true
})

export default mongoose.model('user', User)