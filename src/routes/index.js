const express = require('express');
const router = express.Router();
const authRouter = require('./auth');
const usersRouter = require('./users');
const adminRouter = require('./admin');

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/admin", adminRouter);

module.exports = router;