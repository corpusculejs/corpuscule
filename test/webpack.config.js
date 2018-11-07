/* eslint-disable sort-keys */
module.exports = {
  devtool: 'inline-source-map',
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
              presets: [
                require('@babel/preset-typescript'),
              ],
            },
          },
        ],
      },
    ],
  },
};
