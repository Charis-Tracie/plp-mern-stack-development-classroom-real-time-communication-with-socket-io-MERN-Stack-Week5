// server/controllers/messageController.js
// Implements pagination and creation for messages (in-memory)

const Message = require('../models/Message');

let messages = []; // in-memory store (persist DB in production)

// GET /api/messages?room=global&limit=20&offset=0
exports.getMessages = (req, res) => {
  const room = req.query.room || 'global';
  const limit = Math.min(parseInt(req.query.limit || 20, 10), 100);
  const offset = parseInt(req.query.offset || 0, 10);

  const roomMsgs = messages.filter(m => m.room === room);
  const paginated = roomMsgs.slice(Math.max(0, roomMsgs.length - offset - limit), Math.max(0, roomMsgs.length - offset));
  res.json({
    total: roomMsgs.length,
    limit,
    offset,
    data: paginated,
  });
};

// POST /api/messages  (body: message object)
exports.createMessage = (req, res) => {
  const payload = req.body;
  const msg = new Message(payload);
  messages.push(msg);

  // limit stored messages
  if (messages.length > 1000) messages = messages.slice(-1000);

  res.status(201).json(msg);
};

// helper to mark message read
exports.markRead = (req, res) => {
  const { messageId } = req.params;
  const { reader } = req.body; // e.g., username or socketId
  const msg = messages.find(m => m.id === messageId);
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  if (!msg.readBy.includes(reader)) msg.readBy.push(reader);
  res.json(msg);
};

