const express = require('express');
const groupController = require('../controllers/groupController');
const testController = require('../controllers/testController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.post('/new', groupController.createGroup);
router.get('/new', groupController.createGroupPage);
router.post('/remove', groupController.removeGroup);
router.get('/remove', groupController.removeGroupPage);

router
  .route('/:id')
  .get(groupController.getGroup);

router
  .get('/:id/addStudent', groupController.addStudentToGroupPage)
  .post('/:id/addStudent', groupController.addStudentToGroup)
  .get('/:id/removeStudent', groupController.removeStudentFromGroupPage)
  .post('/:id/removeStudent', groupController.removeStudentFromGroup);

router
  .get('/:id/addSubject', groupController.addSubjectToGroupPage)
  .post('/:id/addSubject', groupController.addSubjectToGroup)
  .get('/:id/removeSubject', groupController.removeSubjectFromGroupPage)
  .post('/:id/removeSubject', groupController.removeSubjectFromGroup);

router
  .get('/:id/addTest', testController.addTestPage)
  .post('/:id/addTest', testController.addTest)
  .get('/:id/removeTest', testController.removeTestPage)
  .post('/:id/removeTest', testController.removeTest);

router
  .get('/:id/:subject_id/addReview', reviewController.addReviewPage)
  .post('/:id/addReview', reviewController.addReview)
  .get('/:id/removeReview', reviewController.removeReviewPage)
  .post('/:id/removeReview', reviewController.removeReview);

  router
  .get('/:id/addEntTrial', testController.addEntTrialPage)
  .post('/:id/addEntTrial', testController.addEntTrial)
  // .get('/:id/removeEntTrials', testController.removeEntTrialPage)
  // .post('/:id/removeEntTrials', testController.removeEntTrialPage)

router
  .route('/:id/trials/:trial_id')
  .get(testController.getTrial)

  router
  .get('/:id/addNUTrial', testController.addNUTrialPage)
  .post('/:id/addNUTrial', testController.addNUTrial)
  // .get('/:id/removeNUTrials', testController.removeNUTrialPage)
  // .post('/:id/removeNUTrials', testController.removeNUTrialPage)


module.exports = router;
