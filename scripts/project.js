const packages = {
  context: ['index'],
  element: ['index'],
  redux: ['index'],
  router: ['index'],
  styles: ['index'],
  utils: [
    'addToRegistry',
    'asserts',
    'compose',
    'createDualDescriptor',
    'descriptors',
    'getSuperMethods',
    'shallowEqual',
    'scheduler',
  ],
};

const definitions = ['typings'];

module.exports = {
  definitions,
  packages,
};
