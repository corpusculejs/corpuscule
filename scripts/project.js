const utils = [
  'asserts',
  'compose',
  'defineExtendable',
  'getSupers',
  'makeAccessor',
  'propertyUtils',
  'scheduler',
  'setters',
  'shallowEqual',
  'tokenRegistry',
];

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
    entries: utils,
    external: utils,
  },
};

const definitions = ['typings'];

module.exports = {
  definitions,
  packages,
};
