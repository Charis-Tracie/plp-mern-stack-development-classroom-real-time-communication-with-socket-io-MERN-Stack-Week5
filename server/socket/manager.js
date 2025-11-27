// server/socket/manager.js
const messageController = require('../controllers/messageController');
const userController = require('../controllers/userController');
const Message = require('../models/Message');

const MAX_STORED = 1000;

module.exports = (io) => {
  const users = {}; // socketId -> {username, id}
  const typingUsers = {}; // socketId -> username
  let messages = []; // local cache (mirror of messageController store)

  // helper to broadcast user list
  const broadcastUsers = () => io.emit('user_list', Object.values(users));

  io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);

    socket.on('user_join', (username) => {
      users[socket.id] = { username, id: socket.id };
      userController._internal_addUser(socket.id, username);
      broadcastUsers();
      io.emit('user_joined', { username, id: socket.id });
    });

    socket.on('send_message', (payload, ack) => {
      // payload can include room, text, attachments, isPrivate, to
      const message = new Message({
        id: Date.now().toString(),
        room: payload.room || 'global',
        sender: users[socket.id]?.username || 'Anonymous',
        senderId: socket.id,
        text: payload.text || payload.message || '',
        timestamp: new Date().toISOString(),
        isPrivate: !!payload.isPrivate,
        to: payload.to || null,
        attachments: payload.attachments || [],
      });

      // store
      messages.push(message);
      if (messages.length > MAX_STORED) messages = messages.slice(-MAX_STORED);

      // persist via controller (so API can read)
      // note: body shape fits Message ctor
      // we simply call createMessage behavior (in-memory)
      // but messageController uses its own array — to keep simple, we also POST to the route
      // skip external HTTP: push into messageController internal array by requiring controller internals isn't provided,
      // so for now rely on messages array and emit directly
      if (message.isPrivate && message.to) {
        // private: emit to target socket and sender only
        socket.to(message.to).emit('private_message', message);
        socket.emit('private_message', message);
      } else {
        io.to(message.room).emit('receive_message', message);
      }

      // deliver acknowledgement back to client (message delivery ack)
      if (ack && typeof ack === 'function') {
        ack({ id: message.id, status: 'delivered' });
      } else {
        socket.emit('message_ack', { id: message.id, status: 'delivered' });
      }
    });

    socket.on('typing', (isTyping) => {
      const username = users[socket.id]?.username;
      if (!username) return;
      if (isTyping) typingUsers[socket.id] = username;
      else delete typingUsers[socket.id];
      io.emit('typing_users', Object.values(typingUsers));
    });

    socket.on('private_message', ({ to, text, attachments }) => {
      const username = users[socket.id]?.username || 'Anonymous';
      const msg = new Message({
        id: Date.now().toString(),
        room: `private:${socket.id}:${to}`,
        sender: username,
        senderId: socket.id,
        text,
        timestamp: new Date().toISOString(),
        isPrivate: true,
        to,
        attachments: attachments || [],
      });

      socket.to(to).emit('private_message', msg);
      socket.emit('private_message', msg);
    });

    socket.on('add_reaction', ({ messageId, emoji }, ack) => {
      // broadcast reaction update - clients should update local msg.reactions
      io.emit('reaction_added', { messageId, emoji, by: users[socket.id]?.username });
      if (ack) ack({ ok: true });
    });

    socket.on('mark_read', ({ messageId, reader }) => {
      io.emit('message_read', { messageId, reader });
    });

    socket.on('join_room', (room) => {
      socket.join(room);
      socket.emit('joined_room', room);
    });

    socket.on('leave_room', (room) => {
      socket.leave(room);
      socket.emit('left_room', room);
    });

    socket.on('disconnect', () => {
      const username = users[socket.id]?.username;
      if (username) {
        delete users[socket.id];
        userController._internal_removeUser(socket.id);
        io.emit('user_left', { username, id: socket.id });
      }
      if (typingUsers[socket.id]) delete typingUsers[socket.id];
      broadcastUsers();
      io.emit('typing_users', Object.values(typingUsers));
      console.log('Socket disconnected', socket.id);
    });
  });

  return {
    getUsers: () => Object.values(users),
  };
};
