// tslint:disable:no-invalid-this
import {Constructor, HTMLElementMock} from '../utils';

export const context = jasmine.createSpyObj('context', [
  'consumer',
  'provider',
]);

context.providingValue = Symbol('providingValue');
context.contextValue = Symbol('consumingValue');

const identity = <T>(descriptor: T) => descriptor;

context.consumer.and.callFake(identity);
context.provider.and.callFake(identity);

const createContext = jasmine.createSpy('createContext');
createContext.and.returnValue(context);

export default createContext;

export const createMockedContextElements = <T extends HTMLElementMock, U extends HTMLElementMock>(
  providerConstructor: Constructor<T>,
  consumerConstructor: Constructor<U>,
  consumerNumber: number = 1,
) => {
  const consumers = new Array(consumerNumber);
  const provider = new providerConstructor();

  for (let i = 0; i < consumerNumber; i++) { // tslint:disable-line:no-increment-decrement
    consumers[i] = new consumerConstructor();
    consumers[i][context.contextValue] = (provider as any)[context.providingValue];
  }

  const storage = Symbol();

  Object.defineProperties(provider, {
    [storage]: {
      value: (provider as any)[context.providingValue],
      writable: true,
    },
    [context.providingValue]: {
      get(this: any): unknown {
        return this[storage];
      },
      set(this: any, value: unknown): void {
        this[storage] = value;

        for (const consumer of consumers) {
          (consumer as any)[context.contextValue] = value;
        }
      },
    },
  });

  provider.connectedCallback();

  for (const consumer of consumers) {
    consumer.connectedCallback();
  }

  return [provider, ...consumers];
};
