const express = require('express');
const {
  getDashboardOverviewController,
  getRevenueAnalyticsController,
  getTopVendorsController,
  getTopProductsController,
  getPlatformMetricsController
} = require('../controllers/dashboard.controller');

const router = express.Router();

/**
 * @swagger
 * /api/admin/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview statistics
 *     tags: [Admin Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       500:
 *         description: Server error
 */
router.get('/overview', getDashboardOverviewController);

/**
 * @swagger
 * /api/admin/dashboard/revenue:
 *   get:
 *     summary: Get revenue analytics data
 *     tags: [Admin Dashboard]
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *         description: Time range for revenue data
 *     responses:
 *       200:
 *         description: Revenue analytics data
 *       500:
 *         description: Server error
 */
router.get('/revenue', getRevenueAnalyticsController);

/**
 * @swagger
 * /api/admin/dashboard/top-vendors:
 *   get:
 *     summary: Get top performing vendors
 *     tags: [Admin Dashboard]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of vendors to return
 *     responses:
 *       200:
 *         description: Top vendors list
 *       500:
 *         description: Server error
 */
router.get('/top-vendors', getTopVendorsController);

/**
 * @swagger
 * /api/admin/dashboard/top-products:
 *   get:
 *     summary: Get top performing products
 *     tags: [Admin Dashboard]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: Top products list
 *       500:
 *         description: Server error
 */
router.get('/top-products', getTopProductsController);

/**
 * @swagger
 * /api/admin/dashboard/platform-metrics:
 *   get:
 *     summary: Get platform performance metrics
 *     tags: [Admin Dashboard]
 *     responses:
 *       200:
 *         description: Platform metrics
 *       500:
 *         description: Server error
 */
router.get('/platform-metrics', getPlatformMetricsController);

module.exports = router; 