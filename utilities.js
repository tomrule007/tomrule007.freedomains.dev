// Start & Stop server functions for test runner
const startServer = (app, port = 3000) =>
  new Promise((resolve, reject) => {
    const server = app
      .listen(port, () => {
        console.log(`Server is running on port ${port}`);
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
        console.log(`Server has been stopped on port ${port}`);
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });

module.exports = { startServer, stopServer };
