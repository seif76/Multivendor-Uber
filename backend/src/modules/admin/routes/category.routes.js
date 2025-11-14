const express = require('express');
const {
  getAdminCategoriesController,
} = require('../controllers/categories.controller');

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
router.get('/', getAdminCategoriesController);


module.exports = router; 