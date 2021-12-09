const express = require('express');
const studentController = require('./../controllers/studentController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');



const router = express.Router();

router.use(authController.isLoggedIn);

router
.get('/:id/', reviewController.getReview)


module.exports = router;