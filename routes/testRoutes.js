const express = require('express');
const testController = require('../controllers/testController');
const authController = require('./../controllers/authController');

const router = express.Router();

// router.param('id', tourController.checkID);
// router.get('/new', testController.addTestPage);
// router.post('/new', testController.addTest);

router
  .route('/:id')
  .get(authController.isLoggedIn, testController.getTest);

module.exports = router;
