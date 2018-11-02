/* eslint-disable no-console, sort-keys */
const {exec} = require('child_process');
const {
  copyFile,
  mkdir,
  readdir,
} = require('fs');
const rimraf = require('rimraf');
const {promisify} = require('util');
const {packages, definitions} = require('./project');

const copyFileAsync = promisify(copyFile);
const execAsync = promisify(exec);
const mkdirAsync = promisify(mkdir);
const readdirAsync = promisify(readdir);
const rimrafAsync = promisify(rimraf);

const root = (pack, file) => `packages/${pack}/${file}`;
const src = (pack, file) => `packages/${pack}/src/${file}`;
const lib = (pack, file) => `packages/${pack}/lib/${file}`;

const libDir = pack => root(pack, 'lib');

const recreateLib = async (pack) => {
  await rimrafAsync(libDir(pack));
  await mkdirAsync(libDir(pack));
};

const dtsPattern = /\.d\.ts/;

const copyDtsFiles = async (pack) => {
  const files = await readdirAsync(root(pack, 'src'));
  await Promise.all(
    files
      .filter(file => dtsPattern.test(file))
      .map(file => copyFileAsync(src(pack, file), lib(pack, file)))
  );
};

const buildCommon = async pack => Promise.all([
  copyDtsFiles(pack),
]);

const build = async (pack) => {
  await recreateLib(pack);

  await Promise.all([
    execAsync(`rollup -c scripts/rollup.config.js`),
    buildCommon(pack),
  ]);

  console.info(`✓ "${pack}" is built`);
};

const buildDefinitions = async (pack) => {
  await recreateLib(pack);
  await buildCommon(pack);

  console.info(`✓ "${pack}" is built`);
};

for (const pack of Object.keys(packages)) {
  build(pack);
}

for (const pack of definitions) {
  buildDefinitions(pack);
}
