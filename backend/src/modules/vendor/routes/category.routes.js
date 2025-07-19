const express = require('express');
const {
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
  getVendorCategoriesController,
  getCategoryByIdController,
  getCategoriesByPhoneController,
} = require('../controllers/category.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');
const { VendorInfo, VendorCategory } = require('../../../app/models');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: VendorCategories
 *     description: Vendor category management endpoints
 */

// All routes require vendor authentication
//router.use(authenticate);

/**
 * @swagger
 * /api/vendor/categories:
 *   post:
 *     summary: Create a new vendor category
 *     tags: [VendorCategories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electronics"
 *     responses:
 *       201:
 *         description: Category created
 *       500:
 *         description: Server error
 */
router.post('/', createCategoryController);

/**
 * @swagger
 * /api/vendor/categories:
 *   get:
 *     summary: Get all categories for the authenticated vendor
 *     tags: [VendorCategories]
 *     responses:
 *       200:
 *         description: List of categories
 *       500:
 *         description: Server error
 */
router.get('/',authenticate, getVendorCategoriesController);

/**
 * @swagger
 * /api/vendor/categories/{categoryId}:
 *   get:
 *     summary: Get a single category by ID
 *     tags: [VendorCategories]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category found
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.get('/:categoryId', authenticate, getCategoryByIdController);

/**
 * @swagger
 * /api/vendor/categories/{categoryId}:
 *   put:
 *     summary: Update a vendor category
 *     tags: [VendorCategories]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Category"
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.put('/:categoryId', authenticate, updateCategoryController);

/**
 * @swagger
 * /api/vendor/categories/{categoryId}:
 *   delete:
 *     summary: Delete a vendor category
 *     tags: [VendorCategories]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete('/:categoryId', authenticate, deleteCategoryController);

/**
 * Public endpoint: Get categories by vendor phone number (no auth)
 */         
router.get('/public-categories-by-phone/:phone_number', getCategoriesByPhoneController);

module.exports = router; 