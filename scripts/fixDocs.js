/* eslint-disable no-console, no-process-exit */
const {readFile, readdir, writeFile} = require('fs');
const {resolve} = require('path');
const {promisify} = require('util');

const readFileAsync = promisify(readFile);
const readdirAsync = promisify(readdir);
const writeFileAsync = promisify(writeFile);

const cwd = process.cwd();

const paths = [
  resolve(cwd, 'docs/classes'),
  resolve(cwd, 'docs/interfaces'),
  resolve(cwd, 'docs/modules'),
];

const definedInPattern = /tsd-sources.+?Defined in\s(?!<)(.+?)</gms;

(async () => {
  try {
    await Promise.all(
      paths.map(async path => {
        const files = await readdirAsync(path);

        await Promise.all(
          files.map(async file => {
            const filePath = resolve(path, file);
            let content = await readFileAsync(filePath, 'utf8');
            let searchResult;

            while ((searchResult = definedInPattern.exec(content)) !== null) {
              const [, match] = searchResult;
              content = content.replace(match, 'external library');
            }

            await writeFileAsync(filePath, content, 'utf8');
          }),
        );
      }),
    );
  } catch (e) {
    console.error(e.stack);
    process.exit(-1);
  }
})();
