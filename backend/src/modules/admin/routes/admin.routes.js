const express = require('express');

// Import all route modules
const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const customersRoutes = require('./customers.routes');
const captainsRoutes = require('./captains.routes');
const vendorsRoutes = require('./vendors.routes');
const ordersRoutes = require('./orders.routes');
const supportRoutes = require('./support.routes');

// Import middleware
const { adminAuthMiddleware } = require('../middlewares/adminAuth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Admin Auth
 *     description: Admin authentication endpoints
 *   - name: Admin Dashboard
 *     description: Admin dashboard and analytics endpoints
 *   - name: Admin Customers
 *     description: Admin customer management endpoints
 *   - name: Admin Captains
 *     description: Admin captain management endpoints
 *   - name: Admin Vendors
 *     description: Admin vendor management endpoints
 *   - name: Admin Orders
 *     description: Admin order management endpoints
 *   - name: Admin Support
 *     description: Admin support chat management endpoints
 */

// Public routes (no authentication required)
router.use('/auth', authRoutes);

// Protected routes (authentication required)
router.use('/dashboard', adminAuthMiddleware, dashboardRoutes);
router.use('/customers', adminAuthMiddleware, customersRoutes);
router.use('/captains', adminAuthMiddleware, captainsRoutes);
router.use('/vendors', adminAuthMiddleware, vendorsRoutes);
router.use('/orders', adminAuthMiddleware, ordersRoutes);
router.use('/support', adminAuthMiddleware, supportRoutes);

/**
 * @swagger
 * /api/admin/health:
 *   get:
 *     summary: Admin module health check
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Admin module is healthy
 */
router.get('/health', (req, res) => {
  res.status(200).json({ 
    message: 'Admin module is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router; 