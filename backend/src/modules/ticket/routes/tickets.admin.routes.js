const express = require('express');
const router = express.Router();
const {
  getAllTicketsController,
  getTicketByIdController,
  updateTicketController,
  getTicketStatsController,
} = require('../controllers/tickets.admin.controller');

router.get('/stats', getTicketStatsController);
router.get('/',      getAllTicketsController);
router.get('/:id',   getTicketByIdController);
router.put('/:id',   updateTicketController);

module.exports = router;