const babel = require('rollup-plugin-babel');
const {packages} = require('./project');

const babelPlugin = babel({
  babelrc: false,
  comments: false,
  extensions: ['.js', '.ts'],
  plugins: [
    [
      require('@babel/plugin-proposal-class-properties'),
      {
        loose: true,
      },
    ],
  ],
  presets: [require('@babel/preset-typescript')],
});

module.exports = pack => {
  const {entries, external = []} = packages[pack];
  const files = new Array(entries.length);

  for (let i = 0; i < files.length; i++) {
    files[i] = {
      input: {
        external: external.map(path => `./${path}`),
        input: `src/${entries[i]}.ts`,
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
