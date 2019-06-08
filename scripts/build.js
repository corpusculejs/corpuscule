/* eslint-disable no-console, no-process-exit */
const {existsSync, mkdir, readFileSync} = require('fs');
const {basename} = require('path');
const rimraf = require('rimraf');
const {rollup} = require('rollup');
const tsc = require('typescript');
const {promisify} = require('util');
const config = require('./rollup.config');
const tsconfig = require('../tsconfig.json');

const mkdirAsync = promisify(mkdir);
const rimrafAsync = promisify(rimraf);

const cwd = process.cwd();
const pack = basename(cwd);

const libDir = 'lib';
const parseConfigHost = {
  fileExists: existsSync,
  readDirectory: tsc.sys.readDirectory,
  readFile(file) {
    return readFileSync(file, 'utf8');
  },
  useCaseSensitiveFileNames: true,
};

const updatedTsconfig = {
  ...tsconfig,
  compilerOptions: {
    ...tsconfig.compilerOptions,
    allowJs: false,
    declaration: true,
    declarationDir: './lib',
    emitDeclarationOnly: true,
    newLine: 'lf',
  },
  include: ['src/**/*.ts'],
};

const runRollup = async () => {
  const options = config(pack);

  await Promise.all(
    options.map(async ({input, output}) => {
      const bundle = await rollup(input);
      await bundle.write(output);
    }),
  );
};

const createDts = () => {
  const {fileNames, options} = tsc.parseJsonConfigFileContent(
    updatedTsconfig,
    parseConfigHost,
    cwd,
  );

  tsc.createProgram(fileNames, options).emit();
};

(async () => {
  try {
    // Recreate lib directory
    await rimrafAsync(libDir);
    await mkdirAsync(libDir);

    // Run Rollup
    await runRollup();

    // Create typescript declaration files
    createDts();
  } catch (e) {
    console.error(e.stack);
    process.exit(-1);
  }
})();
