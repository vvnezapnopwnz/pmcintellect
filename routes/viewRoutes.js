const express = require('express');
const viewController = require('../controllers/viewController');

const router = express.Router();

router
  .route('/:id')
  .get(viewController.getStudentView);


module.exports = router;
