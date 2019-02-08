const {copyFile, mkdir, readdir} = require('fs');
const {basename} = require('path');
const rimraf = require('rimraf');
const {rollup} = require('rollup');
const {promisify} = require('util');
const config = require('./rollup.config');

const copyFileAsync = promisify(copyFile);
const mkdirAsync = promisify(mkdir);
const readdirAsync = promisify(readdir);
const rimrafAsync = promisify(rimraf);

const pack = basename(process.cwd());

const libDir = 'lib';
const srcDir = 'src';

const dtsPattern = /\.d\.ts/;

(async () => {
  // Recreate lib directory
  await rimrafAsync(libDir);
  await mkdirAsync(libDir);

  // Run rollup
  const options = config(pack);

  await Promise.all(
    options.map(async ({input, output}) => {
      const bundle = await rollup(input);
      await bundle.write(output);
    }),
  );

  // Copy d.ts files
  const files = await readdirAsync(srcDir);
  await Promise.all(
    files
      .filter(file => dtsPattern.test(file))
      .map(file => copyFileAsync(`${srcDir}/${file}`, `${libDir}/${file}`)),
  );
})();
