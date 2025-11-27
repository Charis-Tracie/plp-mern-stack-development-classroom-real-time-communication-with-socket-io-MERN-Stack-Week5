// server/controllers/userController.js

const User = require('../models/User');

let users = {}; // socketId -> User

exports.getUsers = (req, res) => {
  res.json(Object.values(users));
};

// This is used by your existing server-side socket logic to update users.
exports._internal_addUser = (socketId, username) => {
  users[socketId] = new User({ username, socketId });
  users[socketId].online = true;
  return users[socketId];
};

exports._internal_removeUser = (socketId) => {
  if (users[socketId]) {
    users[socketId].online = false;
    delete users[socketId];
  }
};

exports._internal_getUsers = () => Object.values(users);
