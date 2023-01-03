const controller = require('../controllers');
const {verifyAccessToken, verifyAdminRole} = require('../middlewares');
const express = require('express');
const router = express.Router();

router.get('/getUserAll', verifyAccessToken, verifyAdminRole, controller.users.getAll);
router.get('/getUser/:userId', verifyAccessToken, verifyAdminRole, controller.users.get);
router.post('/createUser', verifyAccessToken, verifyAdminRole, controller.users.create);
router.put('/updateUser/:userId', verifyAccessToken, verifyAdminRole, controller.users.update);
router.delete('/removeUser/:userId', verifyAccessToken, verifyAdminRole, controller.users.remove);

module.exports = router;