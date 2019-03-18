const packages = {
  context: ['index'],
  element: ['index'],
  form: ['index'],
  'lit-html-renderer': ['index', 'init', 'shady', 'withCustomElement'],
  redux: ['index'],
  router: ['index'],
  styles: ['index'],
  utils: [
    'asserts',
    'compose',
    'descriptors',
    'getSupers',
    'lifecycleDescriptors',
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
