import {
  Constructor,
  CustomElement,
  CustomElementClassProperties,
  DecoratedClassProperties,
} from '@corpuscule/typings';
import {
  internalChangedCallback as $internalChangedCallback,
  propertyChangedCallback as $propertyChangedCallback,
  render as $render,
  updatedCallback as $updatedCallback,
} from './tokens';

export type PropertyGuard = (value: unknown) => boolean;

export type ElementClass<C> = Constructor<
  C,
  CorpusculeElement,
  CustomElementClassProperties & DecoratedClassProperties
>;

export type ElementPrototype<C> = {
  constructor: ElementClass<C>;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface CorpusculeElement extends CustomElement {
  [$internalChangedCallback]?(
    propertyName: PropertyKey,
    oldValue: unknown,
    newValue: unknown,
  ): void;
  [$propertyChangedCallback]?(
    propertyName: PropertyKey,
    oldValue: unknown,
    newValue: unknown,
  ): void;
  [$render]?(): unknown;
  [$updatedCallback]?(): void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {};

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
