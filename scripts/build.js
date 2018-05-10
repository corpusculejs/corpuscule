const {exec} = require('child_process');
const {
  copyFile,
  readdir,
  readFile,
  writeFile,
} = require('fs');
const rimraf = require('rimraf');
const {promisify} = require('util');
const dtsOnly = require('./dtsOnly');
const packages = require('./project');

const copyFileAsync = promisify(copyFile);
const execAsync = promisify(exec);
const readdirAsync = promisify(readdir);
const readFileAsync = promisify(readFile);
const rimrafAsync = promisify(rimraf);
const writeFileAsync = promisify(writeFile);

const createCommonPackageInfo = () => {
  const {
    author,
    bugs,
    homepage,
    license,
    repository,
  } = require('../package');

  return {
    author,
    bugs,
    homepage,
    license,
    main: `index.js`,
    modules: `index.js`,
    esnext: `index.js`,
    repository,
    typings: `index.d.ts`,
  }
};

const root = (pack, file) => `packages/${pack}/${file}`;
const src = (pack, file) => `packages/${pack}/src/${file}`;
const dist = (pack, file) => `packages/${pack}/dist/${file}`;

const recreateDist = async (pack) => {
  await rimrafAsync(root(pack, 'dist'));
};

const copyProjectFiles = async (pack) => {
  const packageJson = await readFileAsync(root(pack, 'package.json'), 'utf8');
  const result = {
    ...JSON.parse(packageJson),
    ...createCommonPackageInfo(),
  };

  await Promise.all([
    writeFileAsync(dist(pack, 'package.json'), JSON.stringify(result, null, 2)),
    copyFileAsync('LICENSE', dist(pack, 'LICENSE')),
  ]);
};

const dtsPattern = /\.d\.ts/;

const copyDtsFiles = async (pack) => {
  const files = await readdirAsync(root(pack, 'src'));
  await Promise.all(
    files
      .filter(file => dtsPattern.test(file))
      .map(file => copyFileAsync(src(pack, file), dist(pack, file)))
  );
};

const build = async (pack) => {
  await recreateDist(pack);

  await Promise.all([
    execAsync(`rollup -c scripts/rollup.config.js`),
    copyProjectFiles(pack),
    dtsOnly(pack),
    copyDtsFiles(pack),
  ]);

  await execAsync(`cd ${root(pack, 'dist')} && npm pack`);

  console.log(`✓ "${pack}" is built`);
};

for (const pack of Object.keys(packages)) {
  build(pack);
}
