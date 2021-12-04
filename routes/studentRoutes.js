const express = require('express');
const studentController = require('./../controllers/studentController');
const authController = require('./../controllers/authController');

const router = express.Router();

// router.param('id', tourController.checkID);
router
  .route('/:id')
  .get(studentController.getStudent)



  router.get('/', authController.isLoggedIn , studentController.getAll);
  router.get('/new', authController.isLoggedIn, studentController.createStudentPage);
  router.post('/new', authController.isLoggedIn, studentController.createStudent);


module.exports = router;