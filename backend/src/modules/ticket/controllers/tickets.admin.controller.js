const {
    getAllTickets,
    getTicketById,
    updateTicket,
    getTicketStats,
  } = require('../services/tickets.admin.services');
  
  const getAllTicketsController = async (req, res) => {
    try {
      const result = await getAllTickets(req.query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  const getTicketByIdController = async (req, res) => {
    try {
      const ticket = await getTicketById(req.params.id);
      res.json(ticket);
    } catch (err) {
      const status = err.message === 'Ticket not found' ? 404 : 500;
      res.status(status).json({ error: err.message });
    }
  };
  
  const updateTicketController = async (req, res) => {
    try {
      const ticket = await updateTicket(req.params.id, req.body);
      res.json({ message: 'Ticket updated successfully', ticket });
    } catch (err) {
      const status = err.message === 'Ticket not found' ? 404 : 500;
      res.status(status).json({ error: err.message });
    }
  };
  
  const getTicketStatsController = async (req, res) => {
    try {
      const stats = await getTicketStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  module.exports = {
    getAllTicketsController,
    getTicketByIdController,
    updateTicketController,
    getTicketStatsController,
  };