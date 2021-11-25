const express = require('express');
const testController = require('./../controllers/testController');
// const authController = require('./../controllers/authController');

const router = express.Router();

// router.param('id', tourController.checkID);
router.get('/new', testController.createTestPage);
router.post('/new', testController.createTest);

router
  .route('/:id')
  .get(testController.getTest)


module.exports = router;