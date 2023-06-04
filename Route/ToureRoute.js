const express = require('express');

const router = express.Router();

const {
  GetTours,
  GetByIdTour,
  PostTour,
  PatchTour,
  DeleteTour,
  aliasTopTours,
  MonthlyPlan,
  CheckID,
  Auth,
  TourStats
} = require('../controller/tourtController');

// Param middleware........................

// router.param('id', CheckID); //This paran middleware excute only on id routes............

// Tours-Routes
router.get('/get-Cheap-Tours', aliasTopTours, GetTours);
// Stats Route..
router.get('/get-stats', TourStats);
// MonthlyPlanRoute
router.get('/monthly-plan/:year', MonthlyPlan);

// Other Routes
router.get('/', GetTours).post('/', PostTour);

// PipeLineFn

router
  .get('/:id', GetByIdTour)
  .patch('/:id', PatchTour)
  .delete('/:id', DeleteTour);

// Exports..
module.exports = router;
