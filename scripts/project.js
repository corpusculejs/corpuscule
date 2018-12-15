const packages = {
  context: ['index'],
  element: ['index'],
  form: ['index'],
  'lit-html-renderer': ['index', 'withCustomElement'],
  redux: ['index'],
  router: ['index'],
  styles: ['index'],
  utils: [
    'addToRegistry',
    'asserts',
    'compose',
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
