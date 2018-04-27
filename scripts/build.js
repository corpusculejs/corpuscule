const {exec} = require('child_process');
const {
  copyFile,
  existsSync,
  readdir,
  readFile,
  readFileSync,
  writeFile,
} = require('fs');
const rimraf = require('rimraf');
const tsc = require('typescript');
const {promisify} = require('util');

const copyFileAsync = promisify(copyFile);
const execAsync = promisify(exec);
const readdirAsync = promisify(readdir);
const readFileAsync = promisify(readFile);
const rimrafAsync = promisify(rimraf);
const writeFileAsync = promisify(writeFile);

const packages = [
  'element',
  'redux',
  'router',
  'styles',
];

const commonPackageInfo = (() => {
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
    main: 'dist/index.js',
    repository,
    typings: 'dist/index.d.ts',
  }
})();

const root = (pack, file) => `packages/${pack}/${file}`;
const src = (pack, file) => `packages/${pack}/src/${file}`;
const dist = (pack, file) => `packages/${pack}/dist/${file}`;

const tsconfig = require('../tsconfig');
const parseConfigHost = {
  fileExists: existsSync,
  readDirectory: tsc.sys.readDirectory,
  readFile: file => readFileSync(file, 'utf8'),
  useCaseSensitiveFileNames: true
};

const removeDist = async (pack) => {
  await rimrafAsync(root(pack, 'dist'));
};

const compileTypescript = (pack) => {
  const config = {
    ...tsconfig,
    include: [
      'src/**/*.ts',
    ],
  };

  const parsed = tsc.parseJsonConfigFileContent(
    config,
    parseConfigHost,
    `packages/${pack}`,
  );

  const program = tsc.createProgram(parsed.fileNames, parsed.options);
  program.emit();
};

const dtsPattern = /\.d\.ts/;

const copyDts = async (pack) => {
  const files = await readdirAsync(root(pack, 'src'));

  for (const file of files) {
    if (dtsPattern.test(file)) {
      copyFileAsync(src(pack, file), dist(pack, file));
    }
  }
};

const copyProjectFiles = async (pack) => {
  const packageJson = await readFileAsync(root(pack, 'package.json'), 'utf8');
  const result = {
    ...JSON.parse(packageJson),
    ...commonPackageInfo,
  };

  await Promise.all([
    writeFileAsync(dist(pack, 'package.json'), JSON.stringify(result, null, 2)),
    copyFileAsync('LICENSE', dist(pack, 'LICENSE')),
  ]);
};

const build = async (pack) => {
  await removeDist(pack);
  compileTypescript(pack);

  await Promise.all([
    copyDts(pack),
    copyProjectFiles(pack),
  ]);

  await execAsync(`cd ${root(pack, 'dist')} && npm pack`);

  console.log(`✓ "${pack}" is built`);
};

(async () => {
  for (const pack of packages) {
    build(pack);
  }
})();
