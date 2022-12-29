const controller = require('../controllers')
const express = require('express');
const router = express.Router();
const {verifyAccessToken} = require('../middlewares');

router.get("/me", verifyAccessToken, controller.users.me);

module.exports = router;