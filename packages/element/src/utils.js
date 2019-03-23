import {createInitializer, createRegistrator} from '@corpuscule/utils/lib/initUtils';
import {createAccessorMaker} from '@corpuscule/utils/lib/descriptorsNew';

export const shared = new WeakMap();

export const [initializer, applyInitializers] = createInitializer();
export const [register, applyRegistrations] = createRegistrator();

export const makeAccessor = createAccessorMaker(initializer);

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
