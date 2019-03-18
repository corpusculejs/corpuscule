const packages = {
  context: {
    entries: ['index'],
  },
  element: {
    entries: ['index'],
  },
  form: {
    entries: ['index'],
  },
  'lit-html-renderer': {
    entries: ['index', 'init', 'shady', 'withCustomElement'],
    external: ['init', 'shady'],
  },
  redux: {
    entries: ['index'],
  },
  router: {
    entries: ['index'],
  },
  styles: {
    entries: ['index'],
  },
  utils: {
    entries: [
      'asserts',
      'compose',
      'descriptors',
      'getSupers',
      'lifecycleDescriptors',
      'propertyUtils',
      'scheduler',
      'shallowEqual',
    ],
    external: [
      'asserts',
      'compose',
      'descriptors',
      'getSupers',
      'lifecycleDescriptors',
      'propertyUtils',
      'scheduler',
      'shallowEqual',
    ],
  },
};

const definitions = ['typings'];

module.exports = {
  definitions,
  packages,
};
