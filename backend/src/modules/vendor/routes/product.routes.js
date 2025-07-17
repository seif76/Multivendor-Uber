const express = require('express');
const {
  createProductController,
  updateProductController,
  deleteProductController,
  getVendorProductsController,
  getProductByIdController,
} = require('../controllers/product.controller');

const { authenticate } = require('../../../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Vendor product management
 */

/**
 * @swagger
 * /api/vendor/products/create-product:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Laptop"
 *               price:
 *                 type: number
 *                 example: 999.99
 *               image:
 *                 type: string
 *                 example: "image.jpg"
 *               stock:
 *                 type: number
 *                 example: 90
 *               category:
 *                 type: string
 *                 example: "food"
 *               description:
 *                 type: string
 *                 example: "High-performance gaming laptop"
 *     responses:
 *       201:
 *         description: Product created
 *       500:
 *         description: Server error
 */
router.post('/create-product', authenticate, createProductController);
/**
 * @swagger
 * /api/vendor/products/get-products:
 *   get:
 *     summary: Get all products for the authenticated vendor
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *       401:
 *         description: Unauthorized
 */
router.get('/get-products', authenticate, getVendorProductsController);

/**
 * @swagger
 * /api/vendor/products/get-product-byId/{productId}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
router.get('/get-product-byId/:productId', authenticate, getProductByIdController);
/**
 * @swagger
 * /api/vendor/products/update-product/{productId}:
 *   put:
 *     summary: Update product details
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               stock:
 *                 type: integer
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */
router.put('/update-product/:productId', authenticate, updateProductController);
/**
 * @swagger
 * /api/vendor/products/delete-product/{productId}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router.delete('/delete-product/:productId', authenticate, deleteProductController);

module.exports = router;
