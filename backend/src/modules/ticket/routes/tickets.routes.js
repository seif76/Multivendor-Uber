
const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middlewares/auth.middleware');
const {
  createTicketController,
  getMyTicketsController,
} = require('../controllers/tickets.controller');

router.post('/', authenticate ,  createTicketController);
router.get('/my', authenticate , getMyTicketsController);

module.exports = router;