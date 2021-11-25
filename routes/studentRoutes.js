const express = require('express');
const studentController = require('./../controllers/studentController');
// const authController = require('./../controllers/authController');

const router = express.Router();

// router.param('id', tourController.checkID);
router.get('/', studentController.getAll);
router.get('/new', studentController.createStudentPage);
router.post('/new', studentController.createStudent);

router
  .route('/:id')
  .get(studentController.getStudent)


module.exports = router;