const express = require('express');
const studentController = require('../controllers/studentController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.get('/async/groups/:month/:group_id', reviewController.getAsyncReviews)
router.get('/async/students/:month/:student_id', reviewController.getStudentAsyncReviews)

router
  .get('/:id/', reviewController.getReview)
  .get('/:id/updateReview', reviewController.updateReviewPage)
  .post('/:id/updateReview', reviewController.updateReview)


module.exports = router;
