const packages = {
  context: ['index'],
  element: ['index'],
  form: ['index'],
  'lit-html-renderer': ['index', 'shady', 'withCustomElement'],
  redux: ['index'],
  router: ['index'],
  styles: ['index'],
  utils: [
    'asserts',
    'compose',
    'descriptors',
    'getSupers',
    'propertyUtils',
    'scheduler',
    'shallowEqual',
  ],
};

const definitions = ['typings'];

module.exports = {
  definitions,
  packages,
};
