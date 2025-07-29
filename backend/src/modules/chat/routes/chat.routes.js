const express = require('express');
const { authenticate } = require('../../../middlewares/auth.middleware');
const {
  createOrFindChatController,
  getUserChatsController,
  getChatMessagesController,
  sendMessageController,
  markMessagesAsReadController,
  getUnreadCountController,
  getChatByIdController,
  closeChatController,
  createOrderChatController,
  getOrderVendorInfoController,
} = require('../controllers/chat.controller');

const router = express.Router();

/**
 * @swagger
 * /api/chat/chats:
 *   get:
 *     summary: Get all chats for the authenticated user
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chats
 *       401:
 *         description: Unauthorized
 */
router.get('/chats', authenticate, getUserChatsController);

/**
 * @swagger
 * /api/chat/chats/{chatId}:
 *   get:
 *     summary: Get a specific chat by ID
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found or access denied
 */
router.get('/chats/:chatId', authenticate, getChatByIdController);

/**
 * @swagger
 * /api/chat/chats/{chatId}/messages:
 *   get:
 *     summary: Get messages for a specific chat
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chat ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of messages to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset for pagination
 *     responses:
 *       200:
 *         description: List of messages
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found or access denied
 */
router.get('/chats/:chatId/messages', authenticate, getChatMessagesController);

/**
 * @swagger
 * /api/chat/chats/{chatId}/messages:
 *   post:
 *     summary: Send a message in a chat
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               content:
 *                 type: string
 *               messageType:
 *                 type: string
 *                 enum: [text, image, file, system]
 *               mediaUrl:
 *                 type: string
 *               mediaType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found or access denied
 */
router.post('/chats/:chatId/messages', authenticate, sendMessageController);

/**
 * @swagger
 * /api/chat/chats:
 *   post:
 *     summary: Create or find a chat between two participants
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participantId:
 *                 type: integer
 *               participantType:
 *                 type: string
 *                 enum: [customer, vendor, captain, admin, support]
 *               chatType:
 *                 type: string
 *                 enum: [support, order, ride, general]
 *               contextId:
 *                 type: integer
 *               contextType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat found or created
 *       401:
 *         description: Unauthorized
 */
router.post('/chats', authenticate, createOrFindChatController);

/**
 * @swagger
 * /api/chat/unread-count:
 *   get:
 *     summary: Get unread message count for the authenticated user
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread message count
 *       401:
 *         description: Unauthorized
 */
router.get('/unread-count', authenticate, getUnreadCountController);

/**
 * @swagger
 * /api/chat/chats/{chatId}/close:
 *   put:
 *     summary: Close a chat
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat closed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found or access denied
 */
router.put('/chats/:chatId/close', authenticate, closeChatController);

// Order chat routes
router.post('/order/:orderId', authenticate, createOrderChatController);
router.get('/order/:orderId/vendor-info', authenticate, getOrderVendorInfoController);

module.exports = router; 