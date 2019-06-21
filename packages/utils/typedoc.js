const commonConfig = require('../../typedoc');
const {resolve} = require('path');

const cwd = process.cwd();

module.exports = {
  ...commonConfig,
  name: '@corpuscule/utils API',
  out: resolve(cwd, '../../docs/api/utils'),
};
