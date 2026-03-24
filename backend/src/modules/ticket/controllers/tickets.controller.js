const {
    createTicket,
    getMyTickets,
    getAllTickets,
    getTicketById,
    updateTicket,
  } = require('../services/tickets.services');
  
  // ── User: Submit ticket ──
  const createTicketController = async (req, res) => {
    try {
      const { category, subject, message, role } = req.body;
      const ticket = await createTicket(req.user.id, role, category, subject, message);
      res.status(201).json({ message: 'Ticket submitted successfully', ticket });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
  
  // ── User: Get my tickets ──
  const getMyTicketsController = async (req, res) => {
    try {
      const tickets = await getMyTickets(req.user.id);
      res.json(tickets);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  // ── Admin: Get all tickets ──
  const getAllTicketsController = async (req, res) => {
    try {
      const result = await getAllTickets(req.query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  // ── Admin: Get single ticket ──
  const getTicketByIdController = async (req, res) => {
    try {
      const ticket = await getTicketById(req.params.id);
      res.json(ticket);
    } catch (err) {
      const status = err.message === 'Ticket not found' ? 404 : 500;
      res.status(status).json({ error: err.message });
    }
  };
  
  // ── Admin: Update ticket ──
  const updateTicketController = async (req, res) => {
    try {
      const ticket = await updateTicket(req.params.id, req.body);
      res.json({ message: 'Ticket updated', ticket });
    } catch (err) {
      const status = err.message === 'Ticket not found' ? 404 : 500;
      res.status(status).json({ error: err.message });
    }
  };
  
  module.exports = {
    createTicketController,
    getMyTicketsController,
    getAllTicketsController,
    getTicketByIdController,
    updateTicketController,
  };