const router = require('express').Router();
const Tesseract = require('tesseract.js');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const TEMP_IMAGE_PATH = './data/p7/';

// Clear temp folder on server start
if (process.env.NODE_ENV !== 'test') {
  require('fs').rmdirSync(TEMP_IMAGE_PATH, { recursive: true });
  fs.mkdir(TEMP_IMAGE_PATH);
}

const upload = multer({ dest: TEMP_IMAGE_PATH });

const jobs = {};

// createJob: Files -> JobId
const createTextExtractJob = (files) => {
  const jobId = uuidv4();
  jobs[jobId] = {};
  files.forEach((file, fileIndex) => {
    Tesseract.recognize(file.path, 'eng', {
      logger: ({ status, progress }) => {
        jobs[jobId][fileIndex] = { status, progress };
      },
    })
      .then(({ data: { text } }) => {
        jobs[jobId][fileIndex] = { ...jobs[jobId][fileIndex], text };
        return fs.unlink(file.path);
      })
      .catch((err) => {
        console.log('TESSERACT_ERROR');
        fs.unlink(file.path);
        throw err;
      });
  });

  return jobId;
};

const FILE_FIELD = 'userFiles';
const MAX_FILE_COUNT = 10;
router.post('/files', upload.array(FILE_FIELD, MAX_FILE_COUNT), (req, res) => {
  const { files } = req;

  if (!files.length)
    return res.status(400).json({
      error: {
        message: `Must provide at least one image file`,
      },
    });

  const allowedExtensions = /\.(jpg|png|jpeg)$/i;
  if (!files.every(({ originalname }) => allowedExtensions.test(originalname)))
    return res.status(400).json({
      error: {
        message: `Unsupported file type. (Only support jpg, png, jpeg image files`,
      },
    });

  const jobId = createTextExtractJob(files);
  return res.status(202).json(jobId);
});

router.get('/api/job/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs[jobId];
  if (!job)
    return res.status(400).json({ error: { message: 'Invalid Job Id' } });

  return res.status(200).json(job);
});

// Error Handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let errResponse;
    switch (err.code) {
      case 'LIMIT_UNEXPECTED_FILE':
        res.status(400);
        errResponse = {
          error: {
            message: `Unexpected field: ${err.field}  (only send: ${FILE_FIELD}) `,
          },
        };
        break;

      default:
        res.status(500);
        errResponse = {
          error: err,
        };

        break;
    }
    return res.json(errResponse);
  }

  if (err === 'UNSUPPORTED_FILE_TYPE')
    return res.status(400).json({
      error: {
        message: `Unexpected field: ${err.field}  (only send: ${FILE_FIELD}) `,
      },
    });

  return res
    .status(500)
    .json({ error: { message: 'Unhandled internal server error' } });
});

module.exports = router;
