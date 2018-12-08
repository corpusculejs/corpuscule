/* eslint-disable sort-keys */
const {resolve} = require('path');

module.exports = {
  devtool: 'inline-source-map',
  mode: 'development',
  resolve: {
    alias: {
      '@corpuscule/context': resolve(__dirname, './mocks/context'),
      'final-form$': resolve(__dirname, './mocks/finalForm'),
      'universal-router$': resolve(__dirname, './mocks/universalRouter'),
    },
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.js/,
        use: [
          {
            loader: 'istanbul-instrumenter-loader',
            options: {
              esModules: true,
            },
          },
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              cacheDirectory: true,
              cacheCompression: false,
              plugins: [
                require('@babel/plugin-proposal-object-rest-spread'),
                require('@babel/plugin-proposal-class-properties'),
              ],
            },
          },
        ],
        include: /packages/,
        exclude: /node_modules|__tests__|lib/,
      },
      {
        test: /\.ts/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              cacheDirectory: true,
              cacheCompression: false,
              plugins: [
                [require('@babel/plugin-proposal-decorators'), {decoratorsBeforeExport: true}],
                require('@babel/plugin-proposal-class-properties'),
                require('@babel/plugin-syntax-dynamic-import'),
              ],
              presets: [require('@babel/preset-typescript')],
            },
          },
        ],
      },
    ],
  },
};
