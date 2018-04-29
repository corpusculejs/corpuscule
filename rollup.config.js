import typescript from 'rollup-plugin-typescript2';

const packages = [
  'element',
  'redux',
  'router',
  'styles',
];

export default packages.reduce((acc, pack) => {
  acc.push({
    input: `packages/${pack}/src/index.ts`,
    output: {
      file: `packages/${pack}/dist/${pack}.js`,
      format: 'es',
    },
    plugins: [
      typescript({
        clean: true,
        tsconfig: 'tsconfig.json',
        tsconfigOverride: {
          compilerOptions: {
            declaration: false,
          },
          include: [
            `packages/${pack}/src/**/*.ts`,
          ],
        }
      }),
    ]
  });

  return acc;
}, []);
