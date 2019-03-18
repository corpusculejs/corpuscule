const babel = require('rollup-plugin-babel');
const {packages} = require('./project');

const babelPlugin = babel({
  babelrc: false,
  plugins: [
    [
      require('@babel/plugin-proposal-class-properties'),
      {
        loose: true,
      },
    ],
  ],
});

module.exports = pack => {
  const {entries, external = []} = packages[pack];
  const files = new Array(entries.length);

  for (let i = 0; i < files.length; i++) {
    files[i] = {
      input: {
        external: external.map(path => `./${path}`),
        input: `src/${entries[i]}.js`,
        plugins: [babelPlugin],
      },
      output: {
        file: `lib/${entries[i]}.js`,
        format: 'es',
      },
    };
  }

  return files;
};
