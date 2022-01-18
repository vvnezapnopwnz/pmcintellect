const express = require('express');
const complexTestController = require('../controllers/complexTestController');
const authController = require('./../controllers/authController');

const router = express.Router();


router
  .route('/:id')
  .get(authController.isLoggedIn, complexTestController.getComplexTest);

module.exports = router;
