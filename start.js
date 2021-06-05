const app = require('./server/app.js');
const { PokemonAPI } = require('./pokemon-api');
const { LessonsAPI } = require('./lessons-api');

const port = process.env.PORT || 8123;

const responseCachePlugin = require('apollo-server-plugin-response-cache');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schema');

async function startApolloServer(app) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
    dataSources: () => ({
      lessonsAPI: new LessonsAPI(),
      pokemonAPI: new PokemonAPI(),
    }),
    plugins: [responseCachePlugin()],
  });
  await server.start();

  server.applyMiddleware({ app });

  console.log(`🚀 GraphQL endpoint: ${server.graphqlPath}`);

  return app;
}

startApolloServer(app).then((app) => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

if (process.env.NODE_ENV === 'development') {
  // BrowserSync proxy
  const bs = require('browser-sync').create();
  bs.init(
    {
      open: false,
      port: process.env.PROXY_PORT || 3000,
      proxy: `http://localhost:${port}`,
      notify: false,
      ws: true,
    },
    () => bs.reload() // Force refresh on first boot
  );

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
