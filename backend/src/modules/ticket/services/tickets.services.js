const { Ticket, User } = require('../../../app/models');
const { Op } = require('sequelize');

// ── Submit ticket ──
const createTicket = async (user_id, role, category, subject, message) => {
  if (!category || !subject || !message || !role) {
    throw new Error('All fields are required');
  }
  const ticket = await Ticket.create({ user_id, role, category, subject, message });
  return ticket;
};

// ── Get my tickets ──
const getMyTickets = async (user_id) => {
  const tickets = await Ticket.findAll({
    where: { user_id },
    order: [['createdAt', 'DESC']],
  });
  return tickets;
};

// ── Admin: Get all tickets with filters ──
const getAllTickets = async ({ role, status, category, page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  const where = {};
  if (role)     where.role     = role;
  if (status)   where.status   = status;
  if (category) where.category = category;

  const { count, rows } = await Ticket.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone_number', 'profile_photo'],
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    tickets: rows,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
  };
};

// ── Admin: Get single ticket ──
const getTicketById = async (id) => {
  const ticket = await Ticket.findByPk(id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: [
          'id', 'name', 'email', 'phone_number', 'profile_photo',
          'vendor_status', 'deliveryman_status', 'customer_status'
        ],
      }
    ]
  });
  if (!ticket) throw new Error('Ticket not found');
  return ticket;
};

// ── Admin: Update ticket ──
const updateTicket = async (id, { status, admin_note }) => {
  const ticket = await Ticket.findByPk(id);
  if (!ticket) throw new Error('Ticket not found');
  await ticket.update({
    ...(status     && { status }),
    ...(admin_note && { admin_note }),
  });
  return ticket;
};

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  updateTicket,
};