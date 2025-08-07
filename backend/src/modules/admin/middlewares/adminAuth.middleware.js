const { verifyAdminToken } = require('../services/auth.service');

// Use the middleware function directly from auth service
const adminAuthMiddleware = verifyAdminToken;

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const requirePermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const permissions = req.admin.permissions;
    if (!permissions || !permissions[resource] || !permissions[resource].includes(action)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = {
  adminAuthMiddleware,
  requireRole,
  requirePermission
}; 