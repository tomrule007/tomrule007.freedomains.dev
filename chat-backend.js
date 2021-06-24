const http = require('http');
const socketIo = require('socket.io');

// TODO: real app would require this information to be stored in a database

// --- DATA STORAGE

const users = {};
const userNames = new Set(['Server']);

// Message store (real app should not store all messages in memory and should have some way to persist msg history)
const messages = [];
const onlineUserNames = new Set();

const socketIdToUserId = {};

// --- END OF DATA STORAGE

// Helper Functions
const createNewUser = (id, name = 'noName', count = 0) => {
  const fullName = count ? name.concat(count) : name;

  if (!userNames.has(fullName)) {
    // create and return unique name.
    const user = { name: fullName };
    users[id] = user;
    userNames.add(fullName);

    return user;
  }

  // inc count and try again
  return createNewUser(id, name, count + 1);
};

// EVENT HANDLERS

const handleMessageCommand = (socket, io, user, msg) => {
  const [command, ...args] = msg.trimEnd().split(' ');

  // Helper function to send message as server admin
  const sendNewMsgFromServerUser = (msg, otherUsers) => {
    const params = [
      'newMsg',
      {
        sender: 'Server',
        time: Date.now(),
        msg,
      },
    ];

    if (otherUsers) {
      socket.broadcast.emit(...params);
    } else {
      socket.emit(...params);
    }
  };

  if (command === '/nick') {
    const desiredName = args[0];

    // Do nothing if name is the same
    if (user.name === desiredName) return;

    // Name already taken
    if (userNames.has(desiredName))
      return sendNewMsgFromServerUser(
        `ERROR: "${desiredName}" is already taken please try another`
      );

    // valid name change, update name and notify users
    const oldName = user.name;
    userNames.delete(oldName);
    userNames.add(desiredName);
    user.name = desiredName;
    console.log(user, users, userNames);
    socket.emit('userInfo', user);
    sendNewMsgFromServerUser(`Your username is now: "${user.name}"`);
    sendNewMsgFromServerUser(
      `"${oldName}" is now known as "${user.name}"`,
      true
    );

    io.emit('userListUpdate', {
      type: 'USER_NAME_CHANGE',
      payload: { oldName, newName: user.name },
    });
  } else {
    sendNewMsgFromServerUser(
      `"${command}" is an invalid command, currently only support "/nick" to change name`
    );
  }
};

const handleMessageReceived = (socket, io, msg) => {
  // receive message -> lookup sender name  -> if cmd send to commandHandler-> create timestamp
  //  -> Add it to message list -> broadcast new message

  const userId = socketIdToUserId[socket.id];

  const user = users[userId];

  // TODO add error message or re request user ID
  if (!user) return;

  if (msg[0] === '/') return handleMessageCommand(socket, io, user, msg);

  const msgNameTime = { sender: user.name, time: Date.now(), msg };

  messages.push(msgNameTime);

  io.emit('newMsg', msgNameTime);
};

const handleMessageHistoryRequest = (socket, io) => {
  socket.emit('messageHistory', messages);
};

const handleGetUserInfo = (socket, io, id) => {
  // receive user id -> lookup (or create) userInfo -> link sessionId to userId
  //-> set user online -> send onlineUserList -> broadcast userListUpdate

  const user = users[id] || createNewUser(id);

  // link socketId to user id;
  socketIdToUserId[socket.id] = id;

  socket.emit('userInfo', user);

  // Update userList and notify users
  onlineUserNames.add(user.name);

  // Send full list to new user and notify other users of new addition
  socket.emit('userListUpdate', {
    type: 'INITIAL_LOAD',
    payload: [...onlineUserNames],
  });

  socket.broadcast.emit('userListUpdate', {
    type: 'USER_SIGN_IN',
    payload: user.name,
  });
};

const handleClientDisconnect = (socket) => {
  // Get user info
  const user = users[socketIdToUserId[socket.id]];

  // TODO: better way of handling logging out of not existent users (ie server restarted)
  if (!user) return;

  // Notify users of sign out
  onlineUserNames.delete(user.name);
  socket.broadcast.emit('userListUpdate', {
    type: 'USER_SIGN_OUT',
    payload: user.name,
  });

  // Delete session id link
  delete socketIdToUserId[socket.id];
};

const handleClientConnect = (socket, io) => {
  // TODO: maybe these could be registered on io server instead of socket (as they are global)
  // client connects -> registers event listeners
  socket.on('getUserInfo', (id) => handleGetUserInfo(socket, io, id));
  socket.on('getMessageHistory', () => handleMessageHistoryRequest(socket, io));
  socket.on('newMsg', (msg) => handleMessageReceived(socket, io, msg));
  socket.on('disconnect', () => handleClientDisconnect(socket));
};

// startSocketIoServer :: App -> http.Server
const startSocketIoServer = (app) => {
  const server = http.createServer(app);
  const io = socketIo(server);
  io.on('connection', (socket) => handleClientConnect(socket, io));
  return server;
};

module.exports = startSocketIoServer;
