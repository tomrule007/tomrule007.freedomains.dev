const path = require('path');

module.exports = {
  entry: {
    app: './client/src/app.js',
    pokemon: './client/src/pokemon/app.js',
    chatroom: './client/src/chatroom/app.js',
  }, // The first file to look into. Move your JavaScript here!
  mode: 'production',
  // devtool: 'eval-source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public/dist'), // We will put the compiled file into public/dist
  },
  module: {
    rules: [
      {
        // This section tells Webpack to use Babel to translate your React into JavaScript
        test: /\.js$/, // Regex for all JavaScript file
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-react'],
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
