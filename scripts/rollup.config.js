const {packages} = require('./project');
const babel = require('rollup-plugin-babel');

const babelPlugin = babel({
  babelrc: false,
  plugins: [
    [
      require('@babel/plugin-proposal-object-rest-spread'),
      {
        loose: true,
        useBuiltIns: true,
      },
    ],
    [
      require('@babel/plugin-proposal-class-properties'),
      {
        loose: true,
      },
    ],
    require('@babel/plugin-syntax-dynamic-import'),
  ],
});

module.exports = Object.entries(packages).reduce((acc, [pack, entries]) => {
  for (const file of entries) {
    acc.push({
      external: ['.'],
      input: `packages/${pack}/src/${file}.js`,
      output: {
        file: `packages/${pack}/lib/${file}.js`,
        format: 'es',
      },
      plugins: [babelPlugin],
    });
  }

  return acc;
}, []);
