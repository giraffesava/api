const mongoose = require("mongoose");
const slugify = require("slugify");
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal then 40 characters"],
      minlength: [10, "A tour name must have more or equal then 10 characters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true }, // each time when the data outputed as json send add virtuals
    toObject: { virtuals: true }, // each time when the data outputed as object send add virtuals
  }
);

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
}); // it's not part of database, so we can't use find methods or other

// DOCUMENT MIDDLEWARE/HOOKS
tourSchema.pre("save", function (next) {
  //console.log(this); //the obj what we are trying to add to db
  this.slug = slugify(this.name, { lower: true });
  next();
}); // runs before .save() and .create() doesn't work with .insertMany()

// tourSchema.post("save", function (doc, next) {
//   next();
// }); // runs after save

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  // /^find/ for every methods which start with find
  this.find({ secretTour: { $ne: true } });
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   next();
// });

// AGGREGATION MIDDLEWARE
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // adding filtering for all aggregation stats
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
