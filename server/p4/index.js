const router = require('express').Router();
const fs = require('fs').promises;

const FILE_DIR = './server/p4/user-files/';
const FILE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// utilities
const getSafeName = (name) => (/^\w+\.?\w+$/.test(name) ? name : null);

const sendUnsafeNameErrorResponse = (res, name) => {
  res.status(400); // bad request
  return res.json({
    error: `Name: ${name} REJECTED! Name can only contain alphanumeric, underscore and one period (for extension name)`,
  });
};

router.get('/api/files/:fileName?', async (req, res) => {
  const { fileName } = req.params;

  try {
    if (!fileName) return res.json(await fs.readdir(FILE_DIR));

    const safeName = getSafeName(fileName);
    if (!safeName) return sendUnsafeNameErrorResponse(res, fileName);

    const fileContents = (await fs.readFile(FILE_DIR + safeName)).toString();
    res.json({ content: fileContents });
  } catch (error) {
    let errorResponse = { error };
    switch (error.code) {
      case 'ENOENT':
        errorResponse = { error: `File, ${safeName}, does not exist` };
        break;

      default:
        break;
    }

    res.status(500);
    res.json(errorResponse);
  }
});

// Create fils  -- tag for deletion 5 minutes
router.post('/api/files', async (req, res) => {
  const { name, content } = req.body;
  if (name === '') {
    res.status(400); // bad request
    return res.json({ error: 'Name field must be present' });
  }

  // Sanitize file input name
  const safeName = getSafeName(name);
  if (!safeName) return sendUnsafeNameErrorResponse(res, name);

  const filePath = FILE_DIR.concat(safeName);
  fs.writeFile(filePath, content)
    .then(() => {
      // TODO: convert to separate 5minute interval
      // script that just checks file timestamps
      // and removes all old files. This will prevent
      // server crashes from loosing track of files and
      // allow file edits to refresh timer.
      setTimeout(() => {
        fs.unlink(filePath).catch((error) =>
          console.log('FILE DELETION ERROR', error)
        );
      }, FILE_TIMEOUT);
      res.status(201); // resource created
      res.set('Location', name);
      res.send();
    })
    .catch((error) => {
      console.log(error);
      res.status(500);
      res.json({ error });
    });
});

module.exports = router;

// TESTING EXPORTS
module.exports.FILE_DIR = FILE_DIR;
module.exports.FILE_TIMEOUT = FILE_TIMEOUT;
