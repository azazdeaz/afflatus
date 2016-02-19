var path = require('path');

module.exports = {
  context: __dirname,
  entry: './src/afflatus',
  output: {
    path: __dirname + '/browser',
    filename: 'afflatus.js',
    library: 'ReactTheme',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  // externals: [
  //   function(context, request, callback) {
  //     var match = /^lodash\/\w+\/(\w+)$/.exec(request)
  //     if(match) {
  //       return callback(null, 'this _.' + match[1]);
  //     }
  //     callback();
  //   },
  // ]
}
