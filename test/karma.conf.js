/* eslint-disable sort-keys,@typescript-eslint/no-require-imports */

const karmaEsm = require('@open-wc/karma-esm');
const cjsTransformer = require('es-dev-commonjs-transformer');
const karmaChromeLauncher = require('karma-chrome-launcher');
const karmaCoverageIstanbulReporter = require('karma-coverage-istanbul-reporter');
const karmaDetectBrowsers = require('karma-detect-browsers');
const karmaFirefoxLauncher = require('karma-firefox-launcher');
const karmaJasmine = require('karma-jasmine');
const karmaSafarinativeLauncher = require('karma-safarinative-launcher');
const {sep} = require('path');
const babelPluginImportRedirect = require('./babelPluginImportRedirect');

process.env.NODE_ENV = 'test';

const isCI = !!process.env.CI;
const cwd = process.cwd();
// eslint-disable-next-line no-sparse-arrays
const [, pack] = new RegExp(`\\${sep}packages\\${sep}(\\w+)`).exec(cwd) || [
  ,
  '*',
];

const babelConfig = {
  presets: ['@babel/preset-typescript', '@corpuscule/babel-preset'],
  plugins: [babelPluginImportRedirect],
};

module.exports = config => {
  config.set({
    basePath: '..',

    plugins: [
      karmaChromeLauncher,
      karmaCoverageIstanbulReporter,
      karmaDetectBrowsers,
      karmaEsm,
      karmaFirefoxLauncher,
      karmaJasmine,
      karmaSafarinativeLauncher,
    ],

    frameworks: ['detectBrowsers', 'esm', 'jasmine'],

    files: [
      {
        pattern: config.grep || `packages/${pack}/__tests__/**/*`,
        type: 'module',
      },
      {
        pattern: 'test/assets/**/*',
        watched: false,
        included: false,
        nocache: false,
        served: true,
      },
    ],

    exclude: [],

    reporters: ['progress', 'coverage-istanbul'],

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: !!config.watch,
    singleRun: !config.watch,
    concurrency: Infinity,

    esm: {
      babel: false,
      babelConfig,
      coverage: !!config.coverage,
      compatibility: 'none',
      dedupe: true,
      fileExtensions: ['.ts'],
      nodeResolve: true,
      responseTransformers: [
        cjsTransformer([
          '**/node_modules/@open-wc/**/*',
          '**/node_modules/jasmine-core/**/*',
          '**/node_modules/karma-jasmine/**/*',
          '**/packages/*/src/**',
        ]),
      ],
    },

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
