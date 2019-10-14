/* eslint-disable no-console, no-process-exit */
const {readFile, writeFile} = require('fs').promises;
const {EOL} = require('os');
const {relative, resolve, sep} = require('path');

const options = process.argv.slice(2);

const restore = !!options.find(option => option.includes('--restore'));
const files = options.filter(option => !option.includes('--'));

const cwd = process.cwd();

const marker = '#URI#';

(async () => {
  try {
    await Promise.all(
      files.map(async file => {
        const filePath = resolve(cwd, file);
        const content = await readFile(filePath, 'utf8');

        const lines = content.split(content.includes(EOL) ? EOL : '\n');
        const processedContent = new Array(lines.length);

        for (let i = 0, len = lines.length; i < len; i++) {
          let processedLine = lines[i];

          const index = lines[i].indexOf(restore ? marker : cwd);

          if (index > -1) {
            const uri = lines[i].slice(index);
            const processedUri = restore
              ? resolve(cwd, uri.slice(marker.length))
              : relative(cwd, uri)
                  .split(sep)
                  .join('/');
            processedLine = lines[i].slice(0, index) + (restore ? '' : marker) + processedUri;
          }

          processedContent[i] = processedLine;
        }

        await writeFile(filePath, processedContent.join('\n'), 'utf8');
        console.log(`Coverage paths in ${file} ${restore ? 'restored' : 'converted'} successfully`);
      }),
    );
  } catch (e) {
    console.error(e.stack);
    process.exit(-1);
  }
})();
