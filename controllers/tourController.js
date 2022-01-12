const Tour = require("./../models/tourModel");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true, // check validation in Model
  });
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

exports.getAllTours = catchAsync(async (req, res, next) => {
  //EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  //SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: null,
  });
});

// Aggregation pipeline
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    { $sort: { avgPrice: 1 } },
    // { $match: { _id: { $ne: "EASY" } } }, - exclude easy difficulty
  ]);
  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year);
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates", // deconstructs an array field
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 }, // sum all of tours
        tours: { $push: "$name" }, // add it to array
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0, // delete id from json data
      },
    },
    {
      $sort: { numTourStarts: -1 }, // it sorts from the biggest to the lowest
    },
    // {
    //   $limit: 6 // limit how many tours we can see
    // }
  ]);
  res.status(200).json({
    status: "success",
    length: plan.length,
    data: {
      plan,
    },
  });
});
