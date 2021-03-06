/* eslint-disable sort-keys */
const {resolve} = require('path');

const coverage = process.argv.find(arg => arg.includes('coverage'));

module.exports = {
  devtool: 'inline-source-map',
  mode: 'development',
  resolve: {
    alias: {
      'final-form$': resolve(__dirname, './mocks/finalForm'),
      'lit-html$': resolve(__dirname, './mocks/litHtml'),
      'lit-html/lib/shady-render$': resolve(__dirname, './mocks/litHtmlShady'),
      'universal-router$': resolve(__dirname, './mocks/universalRouter'),
    },
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.js/,
        use: [
          coverage && {
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
              plugins: ['@babel/plugin-proposal-class-properties'],
            },
          },
        ].filter(Boolean),
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
                [
                  '@babel/plugin-transform-runtime',
                  {
                    corejs: false,
                    helpers: true,
                    regenerator: false,
                    useESModules: true,
                    version: '7.2.2',
                  },
                ],
              ],
              presets: ['@babel/preset-typescript', '@corpuscule/babel-preset'],
            },
          },
        ],
      },
    ],
  },
};
