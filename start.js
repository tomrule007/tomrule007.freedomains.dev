const app = require('./server/app.js');

const port = process.env.PORT || 8123;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

if (process.env.NODE_ENV === 'development') {
  // Browsersync proxy
  const bs = require('browser-sync').create();
  bs.init({
    open: false,
    port: process.env.PROXY_PORT || 3000,
    proxy: `http://localhost:${port}`,
    notify: false,
    ws: true,
  });

  // File Watcher
  const chokidar = require('chokidar');

  const publicWatcher = chokidar.watch('./public');
  publicWatcher.on('ready', function () {
    publicWatcher.on('all', function (event, path) {
      console.log(`File ${event} detected: ${path}`);
      bs.reload();
    });
  });

  const serverWatcher = chokidar.watch('./server');
  serverWatcher.on('ready', function () {
    serverWatcher.on('all', function (event, path) {
      console.log(`File ${event} detected: ${path}`);

      Object.keys(require.cache).forEach(function (id) {
        //Get the local path to the module
        const localId = id.substr(process.cwd().length);

        //Ignore anything not in ./server
        if (!localId.match(/^\/server\//)) return;

        console.log(`Removing Cache: ${localId}`);
        delete require.cache[id];
      });
      bs.reload();
    });
  });
}
