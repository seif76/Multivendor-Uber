const express = require('express');
const { loginCaptainController,registerCaptainController } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/login', loginCaptainController);
router.post('/register', registerCaptainController);

module.exports = router;
