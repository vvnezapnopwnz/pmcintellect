const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const viewController = require('../controllers/viewController');

const router = express.Router();

router.post('/login', authController.login);
// router.get('/login', authController.isLoggedIn, authController.loginPage);
router.get('/logout', authController.logout);

// router.use(authController.isLoggedIn)

router.get('/profile', authController.isLoggedIn, userController.profilePage);

router.get('/dashboard', authController.isLoggedIn, viewController.getDashboardOverview);

module.exports = router;
