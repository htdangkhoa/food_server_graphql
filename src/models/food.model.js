import mongoose, { Schema } from 'mongoose'

const Food = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    auto: true
  },
  name: {
    type: Schema.Types.String,
    required: true
  },
  address: {
    type: Schema.Types.String,
    required: true
  },
  description: {
    type: Schema.Types.String
  },
  price: {
    type: Schema.Types.Number,
    default: 0
  },
  rating: {
    type: Schema.Types.Number,
    max: 5.0,
    default: 0
  },
  tags: {
    type: [{ type: Schema.Types.String, lowercase: true }],
    default: []
  }
}, {
  timestamps: true
})

export default mongoose.model('food', Food)