/* eslint-disable sort-keys */
const {resolve} = require("path");

const cwd = process.cwd();
const root = path => resolve(cwd, path);

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
            loader: "ts-loader",
            options: {
              configFile: root("tsconfig.json"),
            },
          },
        ],
      },
    ],
  },
};
