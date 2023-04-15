const express = require('express');

const router = express.Router();

const {
  GetTours,
  GetByIdTour,
  PostTour,
  PatchTour,
  DeleteTour,
  CheckID,
  Auth
} = require('../controller/tourtController');

// Param middleware........................

router.param('id', CheckID); //This paran middleware excute only on id routes............

// Tours-Routes
router.get('/', GetTours).post('/', Auth, PostTour);
router
  .get('/:id', GetByIdTour)
  .patch('/:id', PatchTour)
  .delete('/:id', DeleteTour);

// Exports..
module.exports = router;
