const typescript = require('rollup-plugin-typescript2');
const packages = require('./project');

module.exports = Object.entries(packages).reduce((acc, [pack, entries]) => {
  const ts = typescript({
    clean: true,
    tsconfig: 'tsconfig.json',
    tsconfigOverride: {
      compilerOptions: {
        declaration: false,
        types: [],
      },
      include: [
        `packages/${pack}/src/**/*.ts`,
      ],
    }
  });

  for (const file of entries) {
    acc.push({
      input: `packages/${pack}/src/${file}.ts`,
      output: {
        file: `packages/${pack}/dist/${file}.js`,
        format: 'es',
      },
      external: [
        '.'
      ],
      plugins: [ts],
    });
  }

  return acc;
}, []);
