import {assertKind, assertPlacement, Kind, Placement} from '@corpuscule/utils/lib/asserts';

export const assertElementProperty = (decoratorName, descriptor) => {
  assertKind(decoratorName, Kind.Field | Kind.Accessor, descriptor);
  assertPlacement(decoratorName, Placement.Own | Placement.Prototype, descriptor);
};

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
