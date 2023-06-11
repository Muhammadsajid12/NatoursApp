const fs = require('fs');
const Tour = require('../model/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// TopToursFn...👌👌
const aliasTopTours = (req, res, next) => {
  //  Building query.....
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,ratingAverage,price,duration,difficulty';
  next();
};

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`)); // important is here no add space in url

// param Middleware..............

// const CheckID = (req, res, next, val) => {

//   if (req.params.id * 1 > tours.length) {
//     res.status(404).json({ msg: 'Your Entered number is invalid' });

//     return;
//   }

//   next();
// };

const Auth = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    res.status(400).json({
      status: 'failed',
      Msg: 'Missing name or Price..'
    });
  }

  next();
};

const GetTours = catchAsync(async (req, res) => {
  // Here we create a class with method filter,sort,pagination,and limitaion.....
  const feature = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Awaiting the query..
  const tours = await feature.query;

  // Response
  res.status(200).json({
    satus: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

const GetByIdTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  // Checking for tour
  if (!tour) {
    return next(
      new AppError(`The Tours not Found by this Id;${req.params.id}`, 404)
    );
  }

  // Send back to response
  res.status(200).json({
    results: 'success',
    data: tour
  });
});

const PostTour = catchAsync(async (req, res) => {
  // const newId = tours[tours.length - 1].id + 1;
  // console.log(newId);
  // const newTour = Object.assign({ id: newId }, req.body); // This obj.assign make a new obj with some extra added fields
  // tours.push(newTour);

  const newTour = await Tour.create(req.body);

  // Response.....🐬🐬🐬
  res.status(201).json({
    message: 'New tour is created........',
    results: newTour.length,
    data: newTour
  });

  // Here we writing the file which data we get from req.body..........👻👻
  // fs.writeFile(`${__dirname}/tours-simple.json`, JSON.stringify(tours), err => {
  //   if (err) {
  //     res.send(`'file not written:${err}`);
  //   } else {
  //     res.status(201).json({
  //       status: 'success',
  //       requesAt: req.Time,
  //       results: tours.length,
  //       data: {
  //         tours
  //       }
  //     });
  //   }
  // });
});

const PatchTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(
    req.params.id,
    req.body,

    { runValidators: true }
  );

  if (!tour) {
    return next(
      new AppError(`The Tours not Found by this Id;${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    results: 'success',
    message: 'Data is updated....',
    data: tour
  });
});

const DeleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndRemove(req.params.id, { new: true });

  if (!tour) {
    return next(
      new AppError(`The Tours not Found by this Id;${req.params.id}`, 404)
    );
  }
  res.status(204).json({
    results: 'success',
    messge: 'Data is deleted....',
    data: tour
  });
});

const TourStats = catchAsync(async (req, res, next) => {
  const Stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } } //? we can match the document multiple time...
    },
    {
      $group: {
        //In Agregation Group is very powerfull feature that group to gather the documents on the base of _id and you can other stuff as well..
        // _id: null,
        _id: '$difficulty',
        // _id: '$ratingAverage',
        // _id: { $toUpper: '$difficulty' },
        // _id: '$maxGroupSize',
        numTours: { $sum: 1 }, // This is very nice trick to sum the grouped document...
        numRating: { $sum: '$ratingQuality' }, // Here just sum the all docs ratings.....
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $match: { _id: { $ne: 4.9 } } //? we can match the document multiple time..
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);

  res.status(200).json({
    results: 'success',
    message: 'Stats get successfully',
    Stats
  });
});

const MonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates' // This operator will create each new document for date.... and date is array of date here unwind operater create individual document for each date
    },
    {
      $match: {
        // This operator show the document which match with this condition...
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        // This will group the document according to Id...
        _id: { $month: '$startDates' }, // This month operator will get the month from the Date....
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' } // This push oprator will create the tours variable as array and push the names of that tours which star at that month
      }
    },
    {
      $addFields: { month: '$_id' } // This will add new field with the month from id as we specify  in group..
    },
    {
      // $project: { _id: 1, numToursStarts: 1, month: 1 } // 0 for remove and 1 for hide.....
      $project: { _id: 0 }
    },
    {
      $sort: { numToursStarts: -1 } // -1 for decending order 1 Accending order...
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    results: plan.length,
    message: 'Plan get successfully',
    plan
  });
});

module.exports = {
  GetTours,
  GetByIdTour,
  PostTour,
  PatchTour,
  DeleteTour,
  aliasTopTours,
  TourStats,
  MonthlyPlan,
  Auth
  // CheckID,
};
