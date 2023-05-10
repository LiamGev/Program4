const express = require('express');
const router = express.Router();
const userControler = require('../controllers/user.controller')
const authController = require('../controllers/authentication.controller');

router.post('/user', authController.validateToken, userControler.validateUser, userControler.registerUser);

router.get('/user', authController.validateToken ,userControler.getAllUsers);

router.get("/user/profile", authController.validateToken, userControler.getUserProfile);

router.get('/user/:userId', authController.validateToken, userControler.getUserById);

router.put("/user/:userId", authController.validateToken, userControler.validateUser, userControler.updateUserFromId);
  
router.delete("/user/:userId", authController.validateToken, authController.validateOwnershipUser, userControler.deleteUserId);

module.exports = router;