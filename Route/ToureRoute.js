const express = require('express');
const { Auth } = require('../controller/authController');
const router = express.Router();

const {
  GetTours,
  GetByIdTour,
  PostTour,
  PatchTour,
  DeleteTour,
  aliasTopTours,
  MonthlyPlan,
  TourStats
} = require('../controller/tourtController');

// Param middleware........................

// router.param('id', CheckID); //This paran middleware excute only on id routes............

// Tours-Routes
router.get('/get-Cheap-Tours', Auth, aliasTopTours, GetTours);
// Stats Route..
router.get('/get-stats', Auth, TourStats);
// MonthlyPlanRoute
router.get('/monthly-plan/:year', Auth, MonthlyPlan);

// Other Routes
router.get('/', Auth, GetTours).post('/', PostTour);

// PipeLineFn

router
  .get('/:id', Auth, GetByIdTour)
  .patch('/:id', Auth, PatchTour)
  .delete('/:id', Auth, DeleteTour);

// Exports..
module.exports = router;
