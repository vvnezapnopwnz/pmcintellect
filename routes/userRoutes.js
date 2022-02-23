const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const viewController = require('../controllers/viewController');

const router = express.Router();

router.post('/login', authController.login);
router.get('/logout', authController.logout);


router.get('/profile', authController.isLoggedIn, userController.profilePage);

router.get('/dashboard', authController.isLoggedIn, viewController.getDashboardOverview);
router.get('/managers', authController.isLoggedIn, viewController.getManagersOverview);

router.get('/new', authController.isLoggedIn, userController.createUserPage);
router.post('/new', authController.isLoggedIn, userController.createUser);

router.get('/update', authController.isLoggedIn, userController.updateUserPage);
router.post('/update', authController.isLoggedIn, userController.updateUser);

router.get('/delete', authController.isLoggedIn, userController.deleteUserPage);
router.post('/delete', authController.isLoggedIn, userController.deleteUser);

router.get('/addnewsubject', authController.isLoggedIn, userController.createNewSubjectPage);
router.post('/addnewsubject', authController.isLoggedIn, userController.createNewSubject);

router.get('/async/findOne/:user_id', authController.isLoggedIn, userController.asyncFindOne);


module.exports = router;
