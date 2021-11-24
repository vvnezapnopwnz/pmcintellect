const express = require('express');
const groupController = require('./../controllers/groupController');
// const testController = require('./../controllers/testController');

const router = express.Router();


router.post('/new', groupController.newGroup);
router.get('/new', groupController.newGroupPage);


router
  .route('/:id')
  .get(groupController.getGroup)

router
.get('/:id/update', groupController.updateGroup)



module.exports = router;