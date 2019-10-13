/* eslint-disable sort-keys */
const webpack = require('./webpack.config');

const isCI = !!process.env.CI;
const watch = !!process.argv.find(arg => arg.includes('watch')) && !isCI;

module.exports = config => {
  config.set({
    basePath: '..',

    plugins: [
      require('karma-webpack'),
      require('karma-jasmine'),
      require('karma-detect-browsers'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-safarinative-launcher'),
    ],

    frameworks: ['jasmine', 'detectBrowsers'],

    files: [
      'test/test.js',
      {
        pattern: './test/assets/**/*',
        watched: false,
        included: false,
        nocache: false,
        served: true,
      },
    ],

    exclude: [],

    preprocessors: {'test/test.js': ['webpack']},
    reporters: ['progress', 'coverage-istanbul'],

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: watch,
    singleRun: !watch,
    concurrency: Infinity,

    webpack,

    proxies: {
      '/assets/': '/base/test/assets/',
    },

    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly'],
      dir: '.coverage',
      combineBrowserReports: true,
      fixWebpackSourcePaths: true,
      skipFilesWithNoCoverage: true,
      'report-config': {
        html: {subdir: 'html'},
        lcovonly: {subdir: 'lcov'},
      },
    },

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
      Safari: {
        base: 'SafariNative',
      },
    },

    detectBrowsers: {
      postDetection(availableBrowsers) {
        const browsers = availableBrowsers.filter(
          browser => browser !== 'IE' && browser !== 'Edge',
        );

        if (isCI) {
          const chromeIndex = browsers.indexOf('ChromeHeadless');

          if (chromeIndex > -1) {
            browsers[chromeIndex] = 'ChromeHeadlessNoSandbox';
          }
        }

        return browsers;
      },
      preferHeadless: true,
      usePhantomJS: false,
    },

    client: {captureConsole: true},
  });
};
