// server/models/Message.js
// Simple in-memory message model

class Message {
  constructor({ id, room = 'global', sender, senderId, text, timestamp, isPrivate = false, to = null, attachments = [], reactions = {}, readBy = [] }) {
    this.id = id || Date.now().toString();
    this.room = room;
    this.sender = sender;
    this.senderId = senderId;
    this.text = text || '';
    this.timestamp = timestamp || new Date().toISOString();
    this.isPrivate = !!isPrivate;
    this.to = to; // target socketId for private messages (if any)
    this.attachments = attachments; // array of {name,url,type}
    this.reactions = reactions; // {emoji: [username,...]}
    this.readBy = readBy; // array of usernames/socketIds who have read it
  }
}

module.exports = Message;
