// tslint:disable:no-invalid-this
import {ExtendedPropertyDescriptor} from '../../packages/typings/src';
import {Constructor, CustomElement, genName} from '../utils';

export const context = jasmine.createSpyObj('context', ['consumer', 'provider', 'value']);

const values: WeakMap<object, string> = new WeakMap();

context.value.and.callFake((descriptor: ExtendedPropertyDescriptor) => ({
  ...descriptor,
  finisher(target: object): void {
    values.set(target, descriptor.key as string);
  },
}));

const identity = <T>(descriptor: T) => descriptor;

context.consumer.and.callFake(identity);
context.provider.and.callFake(identity);

const createContext = jasmine.createSpy('createContext');
createContext.and.returnValue(context);

export default createContext;

export const createMockedContextElements = <T extends CustomElement[]>(
  ...constructors: {[K in keyof T]: Constructor<T[K]>}
): T => {
  const [providerConstructor, ...consumerConstructors] = constructors;

  customElements.define(genName(), providerConstructor);

  const consumers = new Array(consumerConstructors.length);
  const provider = new providerConstructor();
  const providingValue = values.get(providerConstructor)!;

  // tslint:disable-next-line:no-increment-decrement
  for (let i = 0; i < consumerConstructors.length; i++) {
    customElements.define(genName(), consumerConstructors[i]);
    consumers[i] = new consumerConstructors[i]();

    const contextValue = values.get(consumerConstructors[i])!;
    consumers[i][contextValue] = (provider as any)[providingValue];
  }

  const storage = Symbol();

  Object.defineProperties(provider, {
    [storage]: {
      value: (provider as any)[providingValue],
      writable: true,
    },
    [providingValue]: {
      get(this: any): unknown {
        return this[storage];
      },
      set(this: any, value: unknown): void {
        this[storage] = value;

        // tslint:disable-next-line:no-increment-decrement
        for (let i = 0; i < consumers.length; i++) {
          const contextValue = values.get(consumerConstructors[i])!;
          consumers[i][contextValue] = value;
        }
      },
    },
  });

  provider.connectedCallback();

  for (const consumer of consumers) {
    consumer.connectedCallback();
  }

  return [provider, ...consumers] as T;
};
