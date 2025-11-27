// server/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.get('/', messageController.getMessages);
router.post('/', messageController.createMessage);
router.post('/:messageId/read', messageController.markRead);

module.exports = router;
