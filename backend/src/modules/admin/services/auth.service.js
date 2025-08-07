const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin } = require('../../../app/models');

const loginAdminService = async (username, password) => {
  try {
    // Find admin by username or email
    const admin = await Admin.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username: username },
          { email: username }
        ],
        is_active: true
      }
    });

    if (!admin) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await admin.update({ last_login: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username, 
        email: admin.email, 
        role: admin.role,
        permissions: admin.permissions 
      },
      process.env.JWT_SECRET || 'admin-secret-key',
      { expiresIn: '24h' }
    );

    return {
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        last_login: admin.last_login
      }
    };
  } catch (error) {
    throw error;
  }
};

const getAdminProfileService = async (adminId) => {
  try {
    const admin = await Admin.findByPk(adminId, {
      attributes: { exclude: ['password'] }
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    return admin;
  } catch (error) {
    throw error;
  }
};

const updateAdminProfileService = async (adminId, updateData) => {
  try {
    const admin = await Admin.findByPk(adminId);
    
    if (!admin) {
      throw new Error('Admin not found');
    }

    // Hash password if it's being updated
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Remove sensitive fields from update
    delete updateData.role;
    delete updateData.permissions;
    delete updateData.is_active;

    await admin.update(updateData);

    const updatedAdmin = await Admin.findByPk(adminId, {
      attributes: { exclude: ['password'] }
    });

    return updatedAdmin;
  } catch (error) {
    throw error;
  }
};

// Middleware function to verify admin token
const verifyAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid authorization format' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-secret-key');
    
    // Attach admin info to request
    req.admin = decoded;
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else {
      return res.status(500).json({ error: 'Token verification failed' });
    }
  }
};

// Service function to verify token and return admin data
const verifyAdminTokenService = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-secret-key');
    const admin = await Admin.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!admin || !admin.is_active) {
      throw new Error('Invalid token');
    }

    return admin;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  loginAdminService,
  getAdminProfileService,
  updateAdminProfileService,
  verifyAdminToken,
  verifyAdminTokenService
}; 