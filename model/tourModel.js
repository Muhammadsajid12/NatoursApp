const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const Schema = mongoose.Schema;

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [40, 'Name should  40 or less than to 40 charactor'],
      minlength: [10, 'Name should not  less  than 10 charactor ']
      // validate: [
      //   validator.isAlpha,
      //   ' Tour Name should be contained only alphabets'
      // ] //  This validator not work for space
    },
    duration: {
      type: Number,
      required: true
    },
    maxGroupSize: {
      type: Number,
      required: true
    },
    difficulty: {
      type: String,
      required: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Diffculty is either:easy,meduim and difficult'
      }
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'The rating should be above then 1.0'],
      max: [5, 'The rating should be less then 5']
    },
    ratingQuality: {
      type: Number,
      default: 0
    },
    slug: String,
    price: {
      type: Number,
      required: true
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // This validator not work for update the doc.
          return val < this.price;
        },
        message: 'Discount Amount({VALUE}) should be less than price'
      }
    },

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
      required: true
    },
    images: [String],

    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date], // This will store array of dates....
    secretTour: {
      type: Boolean,
      default: false
    },
    userEmail: String
  },
  // In mongose model.Schema we not just send the object we can also add the option object that can allow the virtual property..
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
// Virtual Property...........
// ! We can not use this propery in query beacuase this is not part of the model properties..
// tourSchema.virtual('durationWeeks').get(function() {
//   return this.duration / 7;
// });

// 1)Document MiddleWare: run before save() create() schema ....
// tourSchema.pre('save', function(next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });
// We can add multiple document middleware in row..
// tourSchema.pre('save', function(next) {
//   console.log('This is second middleware😵😵 ...');
//   next();
// });

// Post middleware....
// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// 2)Query Middleware: We have Also pre , and save midlleWare in query middleware as well
// tourSchema.pre(/^find/, function(next) {
//   // This regular expression find run for all mongoose funtion that start with find..
//   this.find({ secretTour: { $ne: true } });
//   this.start = Date.now();
//   // console.log(doc);
//   next();
// });

// tourSchema.post(/^find/, function(doc, next) {
//   // post in query middleware excute after the documents are fetched..
//   this.find({ secretTour: { $ne: true } });
//   console.log(`Query Time Took ${Date.now() - this.start} milliSecond `);
//   // console.log(doc);
//   next();
// });

// 3)AGGREGATION MIDDLEWARE: This  midlle ware have also pre and post method..
// tourSchema.pre('aggregate', function(next) {
//   // Here aggregate is called hook..
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
