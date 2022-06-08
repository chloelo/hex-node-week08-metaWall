const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users')
const { isAuth } = require('../service/auth');

router.post('/sign_up', usersController.signUp);
router.post('/sign_in', usersController.signIn);
router.patch('/update_password', isAuth, usersController.updatePassword);
router.get('/profile', isAuth, usersController.getUser);
router.patch('/profile', isAuth, usersController.updateUser);

module.exports = router;
