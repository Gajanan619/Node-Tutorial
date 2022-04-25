const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const ReviewRouter = require('./../routes/reviewRoutes');


const router = express.Router();

router.param('id', tourController.checkID);
router.param('tourId', tourController.checkID);

router.use("/:tourId/reviews", ReviewRouter);

router.use(authController.AuthProtect);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.AuthorizedProtect('admin'), tourController.checkBody, tourController.createTour);

router
  .route('/tour-stats')
  .get(authController.AuthorizedProtect('admin'), tourController.tourStats)

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.AuthorizedProtect('admin'), tourController.updateTour)
  .delete(authController.AuthorizedProtect("admin"), tourController.deleteTour);



module.exports = router;
