const {exec} = require('child_process');
const {
  copyFile,
  mkdir,
  readFile,
  writeFile,
} = require('fs');
const {join} = require('path');
const rimraf = require('rimraf');
const {file: createTmpFile} = require('tmp');
const {promisify} = require('util');
const packages = require('./project');

const copyFileAsync = promisify(copyFile);
const createTmpFileAsync = promisify(createTmpFile);
const execAsync = promisify(exec);
const mkdirAsync = promisify(mkdir);
const readFileAsync = promisify(readFile);
const rimrafAsync = promisify(rimraf);
const writeFileAsync = promisify(writeFile);

const cwd = process.cwd();

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
    main: `index.js`,
    modules: `index.js`,
    esnext: `index.js`,
    repository,
    typings: `index.d.ts`,
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

const tmpFileData = (async () => {
  const tsconfig = require('../tsconfig');

  const tmpPath = await createTmpFileAsync();

  await writeFileAsync(tmpPath, JSON.stringify({
    ...tsconfig,
    compilerOptions: {
      ...tsconfig.compilerOptions,
      types: [],
    },
  }), 'utf8');

  return tmpPath;
})();

const build = async (pack) => {
  await recreateDist(pack);

  const tmpPath = await tmpFileData;

  await Promise.all([
    execAsync(`rollup -c scripts/rollup.config.js`),
    copyProjectFiles(pack),

    ...packages[pack].map(
      entry => execAsync(`dts-bundle-generator --project ${tmpPath} -o packages/${pack}/dist/${entry}.d.ts packages/${pack}/src/${entry}.ts`)
    ),
  ]);

  await execAsync(`cd ${root(pack, 'dist')} && npm pack`);

  console.log(`✓ "${pack}" is built`);
};

for (const pack of Object.keys(packages)) {
  build(pack);
}
