import {
  Constructor,
  CustomElement,
  DecoratedClassProperties,
} from '@corpuscule/typings';
import basicReflectMethods from '@corpuscule/utils/lib/reflectMethods';
import createTokenRegistry from '@corpuscule/utils/lib/tokenRegistry';

export type Consume = (value: any) => void;
export type Subscribe<C> = (
  this: C,
  event: CustomEvent<ContextEventDetails>,
) => void;
export type Unsubscribe = (consume: Consume) => void;

export type ContextEventDetails = {
  consume: Consume;
  unsubscribe?: Unsubscribe;
};

export type RegistryValues = {
  consumers: PropertyKey;
  value: PropertyKey;
};

export type ContextClass<C> = Constructor<
  C,
  CustomElement,
  DecoratedClassProperties
>;
export type ContextClassPrototype<C> = {
  constructor: Constructor<C, CustomElement, DecoratedClassProperties>;
};

const randomString = (): string => {
  const arr = new Uint32Array(2);
  const [rnd1, rnd2] = crypto.getRandomValues(arr);

  return `${rnd1}${rnd2}`;
};

export const [createContextToken, tokenRegistry] = createTokenRegistry<
  [string, WeakMap<object, unknown>, Set<object>]
>(() => [randomString(), new WeakMap(), new Set()]);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const reflectMethods = <C extends CustomElement>(object: C) =>
  basicReflectMethods(object, ['connectedCallback', 'disconnectedCallback']);

export const $consume = new WeakMap<object, Consume>();
export const $consumers = new WeakMap<object, Consume[]>();
export const $subscribe = new WeakMap<object, Subscribe<object>>();
export const $unsubscribe = new WeakMap<object, Unsubscribe>();
