const router = require('express').Router();
const fs = require('fs').promises;
const fetch = require('node-fetch');

const ROOMS_DIR = './data/p5/';

const saveRoomToDisk = (room, messages) =>
  fs.writeFile(ROOMS_DIR + room, JSON.stringify(messages));

const getRoomFromDiskOrBlank = (room) =>
  fs
    .readFile(ROOMS_DIR + room)
    .then((messages) => JSON.parse(messages))
    .catch((err) => {
      if (err.code === 'ENOENT') {
        return []; //Return empty array on first entry
      } else {
        throw err;
      }
    });

const getSafeRoom = (room) => (/^\w+\.?\w+$/.test(room) ? room : null);

const sendUnsafeRoomErrorResponse = (res, room) => {
  res.status(400); // bad request
  return res.json({
    error: `Room can only contain alphanumeric and underscore characters`,
  });
};

// Check credentials on all requests
router.use(async (req, res, next) => {
  try {
    //Forward request to 3rd party auth
    const authResponse = await fetch('https://js5.c0d3.com/auth/api/session', {
      headers: {
        authorization: req.headers.authorization,
      },
    });
    const authBody = await authResponse.json();

    // If response is error forward to user
    if (!authResponse.ok) {
      console.log('FAIL', authBody);
      return res.status(authResponse.status).json(authBody);
    }
    // Else set user info and continue
    console.log('user is set', authBody);
    req.user = { ...req.user, ...authBody };
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: 'Unhandled Internal Server Error' } });
  }
  next();
});

router.get('/api/session', async (req, res) => res.json(req.user));

router.post('/api/:room/messages', async (req, res) => {
  const { room } = req.params;
  const { message } = req.body;
  const { username } = req.user;

  if (!message)
    return res
      .status(400)
      .json({ error: { message: 'Must include non blank message' } });

  const safeRoom = getSafeRoom(room);
  if (!safeRoom) return sendUnsafeRoomErrorResponse(res, room);

  try {
    const messages = await getRoomFromDiskOrBlank(safeRoom);

    messages.push([username, message]);

    await saveRoomToDisk(safeRoom, messages);

    return res.status(201).set('Location', `/api/${safeRoom}/messages`).send();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/api/:room/messages', async (req, res) => {
  const { room } = req.params;

  const safeRoom = getSafeRoom(room);
  if (!safeRoom) return sendUnsafeRoomErrorResponse(res, room);

  try {
    const messages = await getRoomFromDiskOrBlank(safeRoom);
    res.json(messages);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
