const express = require('express');
const { getAllViewTours, getViewTour, login, isLogin, logout, userAccount, updateUserData } = require('../controllers/viewController');
const { AuthProtect } = require('../controllers/authController');
const router = express.Router();

router.get('/', isLogin, getAllViewTours)
router.get('/account', isLogin, userAccount);
router.get('/login', isLogin, login)
router.get('/tour/:tourName', isLogin, getViewTour);
router.post('/submit-user-data', AuthProtect, updateUserData);//195

router.get('/logout', logout);


module.exports = router