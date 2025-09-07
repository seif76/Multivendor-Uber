const express = require('express');
const {
  testNotificationController,
  postmanTestNotificationController,
  sendNotificationToUserController,
  getNotificationHistoryController,
} = require('../controllers/notifications.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: Push notification management endpoints
 */

/**
 * @swagger
 * /api/notifications/test:
 *   post:
 *     summary: Send a test notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pushToken]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Test Notification"
 *               body:
 *                 type: string
 *                 example: "This is a test notification from the backend!"
 *               pushToken:
 *                 type: string
 *                 example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
 *                 description: "Valid Expo push token from the device"
 *               icon:
 *                 type: string
 *                 example: "ic_notification"
 *                 description: "Icon name for the notification (Android)"
 *               color:
 *                 type: string
 *                 example: "#22c55e"
 *                 description: "Icon color for the notification (Android)"
 *               data:
 *                 type: object
 *                 example: { "type": "test", "timestamp": "2024-01-01T00:00:00.000Z" }
 *     responses:
 *       200:
 *         description: Test notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 notification:
 *                   type: object
 *                 pushToken:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Push token is required
 *       500:
 *         description: Failed to send notification
 */
router.post('/test', testNotificationController);

/**
 * @swagger
 * /api/notifications/postman-test:
 *   post:
 *     summary: Send a test notification using hardcoded token (for Postman testing)
 *     tags: [Notifications]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Postman Test Notification"
 *               body:
 *                 type: string
 *                 example: "This is a test notification from Postman!"
 *               icon:
 *                 type: string
 *                 example: "ic_notification"
 *                 description: "Icon name for the notification (Android)"
 *               color:
 *                 type: string
 *                 example: "#22c55e"
 *                 description: "Icon color for the notification (Android)"
 *               data:
 *                 type: object
 *                 example: { "type": "postman_test", "timestamp": "2024-01-01T00:00:00.000Z" }
 *     responses:
 *       200:
 *         description: Postman test notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 notification:
 *                   type: object
 *                 pushToken:
 *                   type: string
 *                 result:
 *                   type: object
 *                 note:
 *                   type: string
 *       500:
 *         description: Failed to send notification
 */
router.post('/postman-test', postmanTestNotificationController);

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Send notification to specific user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, title, body]
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: "New Message"
 *               body:
 *                 type: string
 *                 example: "You have a new message from John"
 *               data:
 *                 type: object
 *                 example: { "messageId": 123, "senderId": 456 }
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to send notification
 */
router.post('/send', authenticate, sendNotificationToUserController);

/**
 * @swagger
 * /api/notifications/history:
 *   get:
 *     summary: Get notification history
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification history retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       body:
 *                         type: string
 *                       sentAt:
 *                         type: string
 *                       status:
 *                         type: string
 *       500:
 *         description: Failed to get notification history
 */
router.get('/history', authenticate, getNotificationHistoryController);

module.exports = router;
