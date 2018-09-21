/* eslint-disable sort-keys */
module.exports = {
  devtool: "inline-source-map",
  mode: "development",
  resolve: {
    extensions: [
      ".js",
      ".ts",
    ],
  },
  module: {
    rules: [
      {
        test: /\.js/,
        loader: "istanbul-instrumenter-loader",
        enforce: "post",
        options: {
          esModules: true,
        },
        exclude: /node_modules|__tests__/,
      },
      {
        test: /\.ts/,
        use: [
          {
            loader: "babel-loader",
            options: {
              babelrc: false,
              cacheDirectory: true,
              cacheCompression: false,
              plugins: [
                [require("@babel/plugin-proposal-decorators"), {decoratorsBeforeExport: true}],
                require("@babel/plugin-proposal-class-properties"),
                require("@babel/plugin-syntax-dynamic-import"),
              ],
              presets: [
                require("@babel/preset-typescript"),
              ],
            },
          },
        ],
      },
    ],
  },
};
