const {resolve} = require('path');

const cwd = process.cwd();
const root = path => resolve(cwd, path);

module.exports = {
  devtool: 'eval',
  mode: 'development',
  resolve: {
    extensions: [
      '.js',
      '.ts',
    ],
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        loader: 'ts-loader',
        options: {
          configFile: root('tsconfig.test.json'),
        }
      }
    ]
  }
};
