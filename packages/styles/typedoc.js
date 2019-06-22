const commonConfig = require('../../typedoc');
const {resolve} = require('path');

const cwd = process.cwd();

module.exports = {
  ...commonConfig,
  name: '@corpuscule/styles API',
  out: resolve(cwd, '../../docs/api/styles'),
};
