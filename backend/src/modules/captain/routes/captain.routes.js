const express = require('express');
const { registerCaptainController } = require('../controllers/captain.controller');

const router = express.Router();

router.post('/register', registerCaptainController);

module.exports = router;
