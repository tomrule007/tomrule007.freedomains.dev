const compose =
  (...fns) =>
  (x) =>
    fns.reduceRight((x, y) => y(x), x);

const last = (a) => a[a.length - 1];
const split = (separator) => (string) => string.split(separator);

// Start & Stop server functions for test runner
const startServer = (app, port = 3000) =>
  new Promise((resolve, reject) => {
    const server = app
      .listen(port, () => {
        //console.log(`Server is running on port ${port}`);
        resolve([server, port]);
      })
      .on('error', (err) => {
        if (err.errno === 'EADDRINUSE') {
          port += 1;
          server.listen(port);
        } else {
          reject(err);
        }
      });
  });

const stopServer = (server, port) =>
  new Promise((resolve, reject) => {
    try {
      server.close(() => {
        //console.log(`Server has been stopped on port ${port}`);
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });

const logAndThrowErrors = async (response, fileName) => {
  if (response.ok) return;

  const testFile = require('path').basename(fileName);
  const logFile = './errorLog-' + testFile + '.html';

  await fs.writeFile(logFile, await response.text());
  throw Error(`ERROR FILE LOGGED: ${logFile}`);
};

/** Class LRU Cache (Lease Recent Used)*/
class LRUCache {
  /**
   * Creates a LRU Cache
   * @param {Number} size - number of values to cache
   */
  constructor(size) {
    /** @private */
    this.cacheLimit = size;
    /** @private */
    this.cache = {};
    /** @private */
    this.line = [];
  }

  /** @private */
  _sendToBackOfLine(key) {
    const currentPosition = this.line.indexOf(key);

    if (currentPosition === -1) return;

    const removed = this.line.splice(currentPosition, 1);
    this.line.push(key);
  }

  /** @private */
  _removeOldest() {
    const remove = this.line.shift();
    delete this.cache[remove];
  }

  /**
   * Check if key is present in cache
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.cache.hasOwnProperty(key);
  }

  /**
   * Returns matching key value or undefined
   * - also refreshes keys position in cache
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    if (this.has(key)) this._sendToBackOfLine(key);
    return this.cache[key];
  }

  /**
   * Sets key,value pair in cache
   * @param {String} key
   * @param {*} value
   */
  set(key, value) {
    if (this.has(key)) {
      this._sendToBackOfLine(key);
    } else {
      if (this.line.length === this.cacheLimit) this._removeOldest();
      this.line.push(key);
    }

    this.cache[key] = value;
  }
}

module.exports = {
  compose,
  split,
  last,
  startServer,
  stopServer,
  logAndThrowErrors,
  flushPromises,
  LRUCache,
};
