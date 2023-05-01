const fs = require('fs');
const Tour = require('../model/tour');
const APIFeatures = require('../utils/apiFeatures');
// TopToursFn...👌👌
const aliasTopTours = (req, res, next) => {
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
  console.log('Here is the Auth function..........');
  if (!req.body.name || !req.body.price) {
    res.status(400).json({
      status: 'failed',
      Msg: 'Missing name or Price..'
    });
  }

  next();
};

const GetTours = async (req, res) => {
  try {
    // Here we create a class with method filter,sort,pagination,and limitaion.....
    const feature = new APIFeatures(Tour.find(), req.query)
      .limitFields()
      .filter()
      .paginate()
      .sort();

    // Awaiting the query..
    const tours = await feature.query;

    res.status(200).json({
      satus: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: `tours not found due to your bad request..`,
      error: `${error}`
    });
  }
};

const GetByIdTour = async (req, res) => {
  const tour = await Tour.findById(req.params.id);

  try {
    res.status(200).json({
      results: 'success',
      data: tour
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: 'tours not found due to your bad request..'
    });
  }
};

const PostTour = async (req, res) => {
  // const { name, price, rating } = req.body; // you can destructure and then pass the value to create fn...🐾🐾

  // const newId = tours[tours.length - 1].id + 1;
  // console.log(newId);
  // const newTour = Object.assign({ id: newId }, req.body); // This obj.assign make a new obj with some extra added fields
  // tours.push(newTour);

  try {
    const newTour = await Tour.create(req.body);

    // Response.....🐬🐬🐬
    res.status(201).json({
      message: 'New tour is created........',
      results: newTour.length,
      data: newTour
    });
  } catch (error) {
    res.status(400).json({
      status: 'falide',
      data: error
    });
  }

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
};

const PatchTour = async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  try {
    res.status(200).json({
      results: 'success',
      message: 'Data is updated....',
      data: tour
    });
  } catch (error) {
    res.status(400).json({
      status: 'falide',
      data:
        'request is failed due to you missing something in reqbody..........'
    });
  }
};

const DeleteTour = async (req, res) => {
  const tour = await Tour.findByIdAndRemove(req.params.id);

  try {
    res.status(204).json({
      results: 'success',
      messge: 'Data is deleted....',
      data: tour
    });
  } catch (error) {
    res.status(400).json({
      status: 'falide',
      data:
        'request is failed due to you missing something in reqbody..........'
    });
  }
};

module.exports = {
  GetTours,
  GetByIdTour,
  PostTour,
  PatchTour,
  DeleteTour,
  aliasTopTours,
  // CheckID,
  Auth
};
