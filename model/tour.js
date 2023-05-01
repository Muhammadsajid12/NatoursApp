const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tourSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  duration: {
    type: Number,
    require: [true, 'Tour must have duration']
  },
  maxGroupSize: {
    type: Number,
    require: [true, 'Tour must have maxGroupSize']
  },
  difficulty: {
    type: String,
    require: [true, 'Tour must have the difficulty']
  },
  ratingAverage: {
    type: Number,
    default: 4.5
  },
  ratingQuality: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'Tour must have price']
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'Tour image is required.']
  },
  images: [String],

  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date] // This will store array of dates....
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
