// ride.routes.js
const express = require('express');
const { createRideRequestController } = require('../controllers/ride.controller');

const router = express.Router();

router.post('/request', createRideRequestController);

module.exports = router;
