const express = require('express');
const studentController = require('../controllers/studentController');
const authController = require('../controllers/authController');

const router = express.Router();

// router.param('id', tourController.checkID);

router.get('/', authController.isLoggedIn, studentController.getAll);
router.get('/new', authController.isLoggedIn, studentController.createStudentPage);
router.post('/new', authController.isLoggedIn, studentController.createStudent);
router.get('/delete', authController.isLoggedIn, studentController.deleteStudentPage);
router.post('/delete', authController.isLoggedIn, studentController.deleteStudent);
router.get('/reincarnate', authController.isLoggedIn, studentController.reincarnateStudentPage)
router.post('/reincarnate', authController.isLoggedIn, studentController.reincarnateStudent)

router
  .get('/:id/addSubject', authController.isLoggedIn, studentController.addSubjectToStudentPage)
  .post('/:id/addSubject', authController.isLoggedIn, studentController.addSubjectToStudent)
  .get('/:id/removeSubject', authController.isLoggedIn, studentController.removeSubjectFromStudentPage)
  .post('/:id/removeSubject', authController.isLoggedIn, studentController.removeSubjectFromStudent)

router
  .get('/getAll/:group_id', studentController.getAllStudentsAsync)


router
  .route('/:id')
  .get(authController.isLoggedIn, studentController.getStudent);

module.exports = router;
