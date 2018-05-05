const {exec} = require('child_process');
const {
  copyFile,
  mkdir,
  readFile,
  writeFile,
} = require('fs');
const rimraf = require('rimraf');
const {promisify} = require('util');

const copyFileAsync = promisify(copyFile);
const execAsync = promisify(exec);
const mkdirAsync = promisify(mkdir);
const readFileAsync = promisify(readFile);
const rimrafAsync = promisify(rimraf);
const writeFileAsync = promisify(writeFile);

const packages = [
  'element',
  'redux',
  'router',
  'styles',
];

const createCommonPackageInfo = (pack) => {
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
    main: `${pack}.js`,
    modules: `${pack}.js`,
    esnext: `${pack}.js`,
    repository,
    typings: `${pack}.d.ts`,
  }
};

const root = (pack, file) => `packages/${pack}/${file}`;
const dist = (pack, file) => `packages/${pack}/dist/${file}`;

const recreateDist = async (pack) => {
  await rimrafAsync(root(pack, 'dist'));
  await mkdirAsync(root(pack, 'dist'));
};

const copyProjectFiles = async (pack) => {
  const packageJson = await readFileAsync(root(pack, 'package.json'), 'utf8');
  const result = {
    ...JSON.parse(packageJson),
    ...createCommonPackageInfo(pack),
  };

  await Promise.all([
    writeFileAsync(dist(pack, 'package.json'), JSON.stringify(result, null, 2)),
    copyFileAsync('LICENSE', dist(pack, 'LICENSE')),
  ]);
};

const build = async (pack) => {
  await recreateDist(pack);

  await Promise.all([
    execAsync(`rollup -c rollup.config.js`),
    copyProjectFiles(pack),
    execAsync(`dts-bundle-generator --project tsconfig.build.json -o packages/${pack}/dist/${pack}.d.ts packages/${pack}/src/index.ts`),
  ]);

  await execAsync(`cd ${root(pack, 'dist')} && npm pack`);

  console.log(`✓ "${pack}" is built`);
};

for (const pack of packages) {
  build(pack);
}
