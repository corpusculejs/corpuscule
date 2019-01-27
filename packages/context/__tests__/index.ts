// tslint:disable:max-classes-per-file
import {Constructor, CustomElement, genName} from '../../../test/utils';
import createContext from '../src';

const createContextElements = <T extends CustomElement, U extends CustomElement>(
  providerConstructor: Constructor<T>,
  consumerConstructor: Constructor<U>,
  consumersNumber: number = 1,
) => {
  customElements.define(genName(), providerConstructor);
  customElements.define(genName(), consumerConstructor);

  // tslint:disable-line:readonly-array
  const consumers = new Array(consumersNumber);
  const provider = new providerConstructor();
  provider.connectedCallback();

  // tslint:disable-next-line:no-increment-decrement
  for (let i = 0; i < consumersNumber; i++) {
    consumers[i] = new consumerConstructor();

    provider.appendChild(consumers[i]);
    consumers[i].connectedCallback();
  }

  return [provider, ...consumers];
};

describe('@corpuscule/context', () => {
  describe('createContext', () => {
    it('creates context', () => {
      const {consumer, provider, value} = createContext();

      @provider
      class Provider extends CustomElement {
        @value
        public providingValue: number = 2;
      }

      @consumer
      class Consumer extends CustomElement {
        @value
        public contextValue!: number;
      }

      const [, consumerElement] = createContextElements(Provider, Consumer);
      expect(consumerElement.contextValue).toBe(2);
    });

    it('provides context for all consumers', () => {
      const {consumer, provider, value} = createContext();

      @provider
      class Provider extends CustomElement {
        @value
        public providingValue: number = 2;
      }

      @consumer
      class Consumer extends CustomElement {
        @value
        public contextValue!: number;
      }

      const [, consumerElement1, consumerElement2] = createContextElements(Provider, Consumer, 2);

      expect(consumerElement1.contextValue).toBe(2);
      expect(consumerElement2.contextValue).toBe(2);
    });

    it('allows to use default value for context', () => {
      const {consumer, provider, value} = createContext(2);

      @provider
      class Provider extends CustomElement {
        @value
        public providingValue!: number;
      }

      @consumer
      class Consumer extends CustomElement {
        @value
        public contextValue!: number;
      }

      const [providerElement, consumerElement] = createContextElements(Provider, Consumer);

      expect(providerElement.providingValue).toBe(2);
      expect(consumerElement.contextValue).toBe(2);
    });

    it('allows to set value dynamically', () => {
      const {consumer, provider, value} = createContext(2);

      @provider
      class Provider extends CustomElement {
        @value
        public providingValue!: number;
      }

      @consumer
      class Consumer extends CustomElement {
        @value
        public contextValue!: number;
      }

      const [providerElement, consumerElement] = createContextElements(Provider, Consumer);

      providerElement.providingValue = 10;

      expect(consumerElement.contextValue).toBe(10);
    });

    it("calls connectedCallback and disconnectedCallback of user's class", () => {
      const connectedSpy = jasmine.createSpy('onConnect');
      const disconnectedSpy = jasmine.createSpy('onDisconnect');
      const {consumer, provider, value} = createContext();

      @provider
      class Provider extends CustomElement {
        @value
        public providingValue!: number;

        public connectedCallback(): void {
          connectedSpy();
        }

        public disconnectedCallback(): void {
          disconnectedSpy();
        }
      }

      @consumer
      class Consumer extends CustomElement {
        @value
        public contextValue!: number;

        public connectedCallback(): void {
          connectedSpy();
        }

        public disconnectedCallback(): void {
          disconnectedSpy();
        }
      }

      const [providerElement, consumerElement] = createContextElements(Provider, Consumer);

      providerElement.disconnectedCallback();
      consumerElement.disconnectedCallback();

      expect(connectedSpy).toHaveBeenCalledTimes(2);
      expect(disconnectedSpy).toHaveBeenCalledTimes(2);
    });

    it('stops providing value to disconnected consumers', () => {
      const {consumer, provider, value} = createContext();

      @provider
      class Provider extends CustomElement {
        @value
        public providingValue: number = 2;
      }

      @consumer
      class Consumer extends CustomElement {
        @value
        public contextValue!: number;
      }

      const [providerElement, consumerElement] = createContextElements(Provider, Consumer);

      consumerElement.disconnectedCallback();

      providerElement.providingValue = 10;

      expect(consumerElement.contextValue).toBe(2);
    });

    it('throws an error if no provider exists for context', () => {
      const {consumer, value} = createContext();

      @consumer
      class Consumer extends CustomElement {
        @value
        public contextValue!: number;
      }

      customElements.define(genName(), Consumer);

      const consumerElement = new Consumer();

      expect(() => {
        consumerElement.connectedCallback();
      }).toThrowError('No provider found for Consumer');
    });

    it('throws an error if no value is marked with @value', () => {
      const {consumer, provider} = createContext();

      expect(() => {
        @provider
        // @ts-ignore
        class Provider extends CustomElement {}
      }).toThrowError('No Provider field is marked with @value');

      expect(() => {
        @consumer
        // @ts-ignore
        class Consumer extends CustomElement {}
      }).toThrowError('No Consumer field is marked with @value');
    });
  });
});
