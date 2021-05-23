const router = require('express').Router();
// JS5 -  Problem 3
const Jimp = require('jimp');
const { LRUCache } = require('../utilities');

const imageCache = new LRUCache(10);

router.get('/memegen/api/:text?', async (req, res) => {
  const { text } = req.params;
  const { src, blur, black } = req.query;

  res.status(400);
  // text param is required
  if (!text)
    return res.json({ error: 'Must include text as last value in path' });

  // invalid query params error
  const validQueryParams = ['src', 'blur', 'black'];
  const extraQueryParams = Object.keys(req.query).filter(
    (param) => !validQueryParams.includes(param)
  );

  if (extraQueryParams.length > 0) {
    return res.json({ error: `Invalid parameters: ${extraQueryParams}` });
  }

  // invalid query param type error
  if (blur && Number(blur) != blur)
    return res.json({
      error: 'Invalid parameter value: blur expects type Number',
    });

  if (
    black &&
    !(black.toLowerCase() === 'true' || black.toLowerCase() === 'false')
  )
    return res.json({
      error: 'Invalid parameter value: black expects true|false',
    });

  try {
    const fontColor =
      black && black.toLowerCase() === 'true' ? 'BLACK' : 'WHITE';
    const font = await Jimp.loadFont(Jimp[`FONT_SANS_32_${fontColor}`]);
    const image = await Jimp.read(
      imageCache.get(src) || {
        url: src || 'https://placeimg.com/640/480/any',
      }
    );

    if (src) imageCache.set(src, image);

    // blur
    if (blur) await image.blur(Number(blur));

    // add text
    await image.print(
      font,
      0,
      0,
      {
        text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      image.bitmap.width // MaxWidth word wrap at image size
    );

    // get buffer
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    // allow client side caching if src is set
    if (src) res.set('Cache-control', 'public, max-age=18000'); // 5 hours -> 5*60*60 = 18000 seconds

    res.status(200);
    res.set('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (err) {
    let errResponse;

    // Check for known response or serve default;
    switch (err.message) {
      case 'Could not find MIME for Buffer <null>':
      case 'Invalid / unknown URL protocol. Expected HTTP or HTTPS.':
        errResponse = {
          error: `Unable to fetch image, src: ${src}`,
        };
        break;
      default:
        errResponse = {
          error: 'unhandled err',
          msg: err.message,
        };
        break;
    }
    res.json(errResponse);
  }
});

module.exports = router;
