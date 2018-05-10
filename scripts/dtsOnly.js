const {existsSync, readFileSync} = require('fs');
const tsc = require('typescript');
const tsconfig = require('../tsconfig');

const cwd = process.cwd();

const parseConfigHost = {
  fileExists: existsSync,
  readDirectory: tsc.sys.readDirectory,
  readFile: file => readFileSync(file, 'utf8'),
  useCaseSensitiveFileNames: true
};

const dtsOnly = async (pack) => {
  const {fileNames, options} = tsc.parseJsonConfigFileContent(
    {
      ...tsconfig,
      compilerOptions: {
        ...tsconfig.compilerOptions,
        outDir: `packages/${pack}/dist`
      },
      include: [
        `packages/${pack}/src/**/*.ts`
      ],
    },
    parseConfigHost,
    cwd,
  );

  const program = tsc.createProgram(fileNames, options);
  program.emit(undefined, undefined, undefined, true);
};

module.exports = dtsOnly;
