const { Ticket, User } = require('../../../app/models');
const { Op } = require('sequelize');

const getAllTickets = async ({ role, status, category, page = 1, limit = 10 }) => {
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where = {};

  if (role     && role     !== 'all') where.role     = role;
  if (status   && status   !== 'all') where.status   = status;
  if (category && category !== 'all') where.category = category;

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
    offset,
  });

  return {
    tickets: rows,
    total: count,
    totalPages: Math.ceil(count / parseInt(limit)),
    currentPage: parseInt(page),
  };
};

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

const updateTicket = async (id, { status, admin_note }) => {
  const ticket = await Ticket.findByPk(id);
  if (!ticket) throw new Error('Ticket not found');

  await ticket.update({
    ...(status     !== undefined && { status }),
    ...(admin_note !== undefined && { admin_note }),
  });

  return ticket;
};

const getTicketStats = async () => {
  const [open, in_progress, resolved, closed] = await Promise.all([
    Ticket.count({ where: { status: 'open' } }),
    Ticket.count({ where: { status: 'in_progress' } }),
    Ticket.count({ where: { status: 'resolved' } }),
    Ticket.count({ where: { status: 'closed' } }),
  ]);

  return {
    open_tickets: open,
    active: open + in_progress,
    resolved,
    closed,
    total: open + in_progress + resolved + closed,
  };
};

module.exports = {
  getAllTickets,
  getTicketById,
  updateTicket,
  getTicketStats,
};