const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ! Would be environment variable in real app
const SECRET_JWT_KEY = 'moreLikePublicKey';

const createJwtToken = (user) =>
  new Promise((resolve, reject) => {
    jwt.sign(user, SECRET_JWT_KEY, { algorithm: 'HS256' }, (err, token) =>
      err ? reject(err) : resolve(token)
    );
  });

const verifyJwtToken = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, SECRET_JWT_KEY, (err, decoded) =>
      err ? reject(err) : resolve(decoded)
    );
  });

const encryptPassword = (password) =>
  new Promise((resolve, reject) => {
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) =>
      err ? reject(err) : resolve(hash)
    );
  });

const verifyPassword = (password, hash) =>
  new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, result) =>
      err ? reject(err) : resolve(result)
    );
  });

// Mock User for testing
const VALID_MOCK_USER_PASSWORD = 'superSecure';
const VALID_MOCK_USER = {
  name: 'tommy',
  username: 'testUser',
  email: 'test@mock.com',
  id: 'c60c7e46-5719-41df-bc35-405c0e678236',
  hash: '$2b$10$La1oIdvnCAUfHPLkc0onqe09pfZlhDVi8LRw8eMPWcGtvpQLIV7je',
};

const users = process.env.NODE_ENV === 'test' ? [VALID_MOCK_USER] : [];

const isUniqueUsername = (username) =>
  !users.some((user) => user.username === username);

const getUserByKeyValue = (keyValue) =>
  users.find((user) => {
    const [[key, value]] = Object.entries(keyValue);

    return user[key] === value;
  });

router.post('/api/users', async (req, res) => {
  const { password, username, email, ...extras } = req.body;

  if (!password || password.length <= 5)
    return res.status(400).json({
      error: {
        message:
          'password field cannot be empty and must be base 64 encoded with more than 5 characters',
      },
    });

  const alphaNumericOnly = /^[a-z09]+$/i;
  if (!username || !alphaNumericOnly.test(username))
    return res.status(400).json({
      error: {
        message:
          'username field cannot be blank and must contain alpha numeric characters only',
      },
    });

  if (!isUniqueUsername(username))
    return res.status(400).json({
      error: {
        message: 'username is already registered',
      },
    });

  const validEmail = /^\w+@\w+\.?\w*$/;
  if (!email || !validEmail.test(email))
    return res.status(400).json({
      error: {
        message: 'email field cannot be blank and must be a valid email',
      },
    });

  // Create user
  await encryptPassword(password)
    .then((hash) => {
      const newUser = { email, username, id: uuidv4(), ...extras };
      users.push({ ...newUser, hash });
      return createJwtToken(newUser).then((jwt) =>
        res.status(200).json({ ...newUser, jwt })
      );
    })
    .catch((err) => {
      console.log('encryptPassword', err);
      return res.status(500).json('Internal Server Error');
    });
});

router.post('/api/sessions', async (req, res) => {
  const { username, email, password } = req.body;
  if (username && email)
    return res.status(400).json({
      error: { message: 'Only send password with email OR username' },
    });

  const { hash, ...user } = username
    ? getUserByKeyValue({ username })
    : email
    ? getUserByKeyValue({ email })
    : null;

  if (!user || !hash)
    return res.status(400).json({ error: { message: 'User not found' } });

  verifyPassword(password, hash)
    .then((isValidPassword) => {
      if (!isValidPassword)
        return res.status(400).json({ error: { message: 'User not found' } });
      return createJwtToken(user).then((jwt) => {
        return res.status(200).json({ ...user, jwt });
      });
    })
    .catch((err) => {
      console.log('encryptPassword', err);
      return res.status(500).json('Internal Server Error');
    });
});

router.get('/api/sessions', async (req, res) => {
  const jwt = (req.headers.authorization || '').split(' ').pop();

  const expireTime = Math.floor(Date.now() / 1000) - 60 * 60; // Token expires after 1hr
  await verifyJwtToken(jwt)
    .then((decoded) => {
      const { iat, ...payload } = decoded || {};
      payload && iat > expireTime
        ? res.status(200).json({ ...payload, jwt })
        : res.status(400).json({ error: { message: 'Not logged in' } });
    })
    .catch((err) => {
      console.log('verifyJwtToken', err);
      return res.status(500).json('Internal Server Error');
    });
});

module.exports = router;
module.exports.VALID_MOCK_USER = VALID_MOCK_USER;
module.exports.VALID_MOCK_USER_PASSWORD = VALID_MOCK_USER_PASSWORD;
