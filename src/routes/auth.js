const controller = require('../controllers')
const express = require('express');
const router = express.Router();

router.post("/signup", controller.auth.signup);
router.post("/login", controller.auth.login);
router.post("/logout", controller.auth.logout);
router.post("/logoutAll", controller.auth.logoutAll);
router.post("/accessToken", controller.auth.newAccessToken);
router.post("/refreshToken", controller.auth.newRefreshToken);

module.exports = router;