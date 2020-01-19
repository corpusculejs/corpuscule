import {
  Constructor,
  CustomElement,
  DecoratedClassProperties,
} from '@corpuscule/typings';
import basicReflectMethods from '@corpuscule/utils/lib/reflectMethods';
import createTokenRegistry from '@corpuscule/utils/lib/tokenRegistry';

export type Consume = (value: any) => void;
export type Subscribe = (event: CustomEvent<ContextEventDetails>) => void;
export type Unsubscribe = (consume: Consume) => void;

export type ContextEventDetails = {
  consume: Consume;
  unsubscribe?: Unsubscribe;
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

export const [createContextToken, tokenRegistry, share] = createTokenRegistry(
  () => ({
    consume: new WeakMap<object, Consume>(),
    consumers: new WeakMap<object, Consume[]>(),
    eventName: randomString(),
    providers: new WeakSet(),
    subscribe: new WeakMap<object, Subscribe>(),
    unsubscribe: new WeakMap<object, Unsubscribe>(),
    value: new WeakMap(),
  }),
  undefined,
  ({value}) => value,
);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const reflectMethods = <C extends CustomElement>(object: C) =>
  basicReflectMethods(object, ['connectedCallback', 'disconnectedCallback']);
