/* eslint-disable sort-keys */
// Karma configuration
// Generated on Sun Apr 29 2018 20:36:45 GMT+0300 (RTZ 2 (зима))
const webpack = require("./webpack.config");

// process.env.CHROME_BIN = require("puppeteer").executablePath();

const isCI = !!process.env.CI;

module.exports = (config) => {
  config.set({
    // Base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "..",

    plugins: [
      require("karma-webpack"),
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-coverage-istanbul-reporter"),
    ],

    // Frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["jasmine"],

    // List of files / patterns to load in the browser
    files: [
      "test/test.js",
    ],

    // List of files / patterns to exclude
    exclude: [
    ],

    // Preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {"test/test.js": ["webpack"]},

    // Test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["progress", "coverage-istanbul"],

    // Web server port
    port: 9876,

    // Enable / disable colors in the output (reporters and logs)
    colors: true,

    // Level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Enable / disable watching file and executing test whenever any file changes
    autoWatch: !isCI,

    // Start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: isCI ? ["ChromeHeadlessNoSandbox"] : ["Chrome"],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the test and exits
    singleRun: isCI,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    webpack,

    coverageIstanbulReporter: {
      reports: ["html", "lcovonly"],
      dir: ".coverage",
      combineBrowserReports: true,
      fixWebpackSourcePaths: true,
      skipFilesWithNoCoverage: true,
      "report-config": {
        html: {subdir: "html"},
        lcovonly: {subdir: "lcov"},
      },
    },

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox"],
      },
    },

    client: {captureConsole: true},
  });
};
