export const shared = new WeakMap();

export const defaultDescriptor = {
  configurable: true,
  enumerable: true,
};

// eslint-disable-next-line no-empty-function
export const noop = () => {};

export const shadowElements = [
  'article',
  'aside',
  'blockquote',
  'body',
  'div',
  'footer',
  'header',
  'main',
  'nav',
  'p',
  'section',
  'span',
];
