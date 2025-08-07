const express = require('express');
const {
  getAllChatsController,
  getChatMessagesController,
  sendAdminMessageController,
  updateChatStatusController,
  getChatStatsController,
  searchChatsController
} = require('../controllers/support.controller');

const router = express.Router();

/**
 * @swagger
 * /api/admin/support/chats:
 *   get:
 *     summary: Get all support chats with pagination and filtering
 *     tags: [Admin Support]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of chats per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, pending, closed]
 *         description: Filter by chat status
 *     responses:
 *       200:
 *         description: List of support chats
 *       500:
 *         description: Server error
 */
router.get('/chats', getAllChatsController);

/**
 * @swagger
 * /api/admin/support/chats/{chatId}/messages:
 *   get:
 *     summary: Get messages for a specific chat
 *     tags: [Admin Support]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat messages
 *       500:
 *         description: Server error
 */
router.get('/chats/:chatId/messages', getChatMessagesController);

/**
 * @swagger
 * /api/admin/support/chats/{chatId}/messages:
 *   post:
 *     summary: Send admin message to a chat
 *     tags: [Admin Support]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/chats/:chatId/messages', sendAdminMessageController);

/**
 * @swagger
 * /api/admin/support/chats/{chatId}/status:
 *   put:
 *     summary: Update chat status
 *     tags: [Admin Support]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, pending, closed]
 *     responses:
 *       200:
 *         description: Chat status updated
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.put('/chats/:chatId/status', updateChatStatusController);

/**
 * @swagger
 * /api/admin/support/stats:
 *   get:
 *     summary: Get support statistics
 *     tags: [Admin Support]
 *     responses:
 *       200:
 *         description: Support statistics
 *       500:
 *         description: Server error
 */
router.get('/stats', getChatStatsController);

/**
 * @swagger
 * /api/admin/support/search:
 *   get:
 *     summary: Search support chats
 *     tags: [Admin Support]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.get('/search', searchChatsController);

module.exports = router; 