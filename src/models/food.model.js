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
  counting: {
    type: [{ type: Schema.Types.Number, max: 5 }],
    default: []
  },
  tags: {
    type: [{ type: Schema.Types.String, lowercase: true }],
    default: []
  },
  images: {
    type: [{ type: Schema.Types.String }],
    default: []
  }
}, {
  timestamps: true
}).index({
  tags: 'text'
})

export default mongoose.model('food', Food)