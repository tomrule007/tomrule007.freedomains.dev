const router = require('express').Router();
const fs = require('fs');
const md5 = require('md5');
const path = require('path');

const USER_SELFIE_PATH = './public/p8/selfie/';
const USER_SELFIE_URL = '/p8/selfie/';

// Create directory if it doesn't exist
fs.mkdirSync(USER_SELFIE_PATH, { recursive: true });

// Load and sort selfies by date
const sortedSelfies = new Set(
  fs
    .readdirSync(USER_SELFIE_PATH)
    .map((file) => ({
      file,
      time: fs.statSync(USER_SELFIE_PATH + file).mtime.getTime(),
    }))
    .sort((a, b) => a.time - b.time)
    .map(({ file }) => USER_SELFIE_URL + file)
);

router.post('/api/selfie', async (req, res) => {
  const { selfie } = req.body;
  if (!selfie)
    return res
      .status(400)
      .json({ error: { message: "Missing 'selfie' field" } });

  const uniqueName = md5(selfie).concat('.png');

  await fs.promises.writeFile(
    USER_SELFIE_PATH + uniqueName,
    selfie.split(',').pop(), //Insures the user didn't include meta data
    'base64'
  );
  const selfieUrl = USER_SELFIE_URL + uniqueName;

  sortedSelfies.add(selfieUrl);

  res.status(200).json({ link: '/p8/selfie/' + uniqueName });
});

router.get('/api/selfie', async (req, res) => {
  res.status(200).json({ links: [...sortedSelfies] });
});

// ERROR HANDLER
router.use((err, req, res, next) => {
  console.log(err);

  return res
    .status(500)
    .json({ error: { message: 'Unhandled internal server error' } });
});

module.exports = router;
// Used for cleaning up after tests
module.exports.USER_SELFIE_PATH = USER_SELFIE_PATH;
