import {defineCE, fixture} from '@open-wc/testing-helpers';
import {Constructor, CustomElement} from '../../../test/utils';
import createContext from '../src';

const mountDefaultContext = async <P extends Element, C extends Element>(
  Provider: Constructor<P>, // tslint:disable-line:naming-convention
  Consumer: Constructor<C>, // tslint:disable-line:naming-convention
): Promise<[P, C]> => {
  const providerTag = defineCE(Provider);
  const consumerTag = defineCE(Consumer);

  const providerElement = await fixture(`
        <${providerTag}>
          <${consumerTag}></${consumerTag}>
        </${providerTag}>
      `);

  return [providerElement as P, providerElement.children[0] as C];
};

describe('@corpuscule/context', () => {
  describe('createContext', () => {
    it('creates context', async () => {
      const {consumer, provider, value} = createContext();

      @provider
      class Provider extends CustomElement {
        @value public providingValue: number = 2;
      }

      @consumer
      class Consumer extends CustomElement {
        @value public contextValue!: number;
      }

      const [, consumerElement] = await mountDefaultContext(Provider, Consumer);

      expect(consumerElement.contextValue).toBe(2);
    });

    it('provides context for all consumers', async () => {
      const {consumer, provider, value} = createContext();

      @provider
      class Provider extends CustomElement {
        @value public providingValue: number = 2;
      }

      @consumer
      class Consumer extends CustomElement {
        @value public contextValue!: number;
      }

      const providerTag = defineCE(Provider);
      const consumerTag = defineCE(Consumer);

      const providerElement = await fixture(`
        <${providerTag}>
          <${consumerTag}></${consumerTag}>
          <${consumerTag}></${consumerTag}>
        </${providerTag}>
      `);

      const [consumerElement1, consumerElement2] = Array.from<Consumer>(
        providerElement.children as any,
      );

      expect(consumerElement1.contextValue).toBe(2);
      expect(consumerElement2.contextValue).toBe(2);
    });

    it('allows to use default value for context', async () => {
      const {consumer, provider, value} = createContext(2);

      @provider
      class Provider extends CustomElement {
        @value public providingValue!: number;
      }

      @consumer
      class Consumer extends CustomElement {
        @value public contextValue!: number;
      }

      const [providerElement, consumerElement] = await mountDefaultContext(Provider, Consumer);

      expect(providerElement.providingValue).toBe(2);
      expect(consumerElement.contextValue).toBe(2);
    });

    it('allows to set value dynamically', async () => {
      const {consumer, provider, value} = createContext(2);

      @provider
      class Provider extends CustomElement {
        @value public providingValue!: number;
      }

      @consumer
      class Consumer extends CustomElement {
        @value public contextValue!: number;
      }

      const [providerElement, consumerElement] = await mountDefaultContext(Provider, Consumer);

      providerElement.providingValue = 10;

      expect(consumerElement.contextValue).toBe(10);
    });

    it("calls connectedCallback and disconnectedCallback of user's class", async () => {
      const connectedSpy = jasmine.createSpy('onConnect');
      const disconnectedSpy = jasmine.createSpy('onDisconnect');
      const {consumer, provider, value} = createContext();

      @provider
      class Provider extends CustomElement {
        @value public providingValue!: number;

        public connectedCallback(): void {
          connectedSpy();
        }

        public disconnectedCallback(): void {
          disconnectedSpy();
        }
      }

      @consumer
      class Consumer extends CustomElement {
        @value public contextValue!: number;

        public connectedCallback(): void {
          connectedSpy();
        }

        public disconnectedCallback(): void {
          disconnectedSpy();
        }
      }

      const [providerElement, consumerElement] = await mountDefaultContext(Provider, Consumer);

      consumerElement.remove();
      providerElement.remove();

      expect(connectedSpy).toHaveBeenCalledTimes(2);
      expect(disconnectedSpy).toHaveBeenCalledTimes(2);
    });

    it('stops providing value to disconnected consumers', async () => {
      const {consumer, provider, value} = createContext();

      @provider
      class Provider extends CustomElement {
        @value public providingValue: number = 2;
      }

      @consumer
      class Consumer extends CustomElement {
        @value public contextValue!: number;
      }

      const [providerElement, consumerElement] = await mountDefaultContext(Provider, Consumer);

      consumerElement.remove();

      providerElement.providingValue = 10;

      expect(consumerElement.contextValue).toBe(2);
    });

    it("removes any default consumer's value", async () => {
      const {consumer, provider, value} = createContext();
      const constructorSpy = jasmine.createSpy('constructor');

      @provider
      class Provider extends CustomElement {
        @value public providingValue: number = 2;
      }

      @consumer
      class Consumer extends CustomElement {
        @value public contextValue: number = 3;

        public constructor() {
          super();
          expect(this.contextValue).toBeUndefined();
          constructorSpy();
        }
      }

      await mountDefaultContext(Provider, Consumer);

      expect(constructorSpy).toHaveBeenCalled();
    });

    it('detects provider', () => {
      const {isProvider, provider, value} = createContext();

      @provider
      class Provider extends CustomElement {
        @value public providingValue: number = 2;
      }

      expect(isProvider(Provider)).toBeTruthy();
    });

    it('throws an error if no provider exists for context', done => {
      const {consumer, value} = createContext();

      @consumer
      class Consumer extends CustomElement {
        @value public contextValue!: number;
      }

      const tag = defineCE(Consumer);

      window.onerror = message => {
        expect(message).toEqual('Uncaught Error: No provider found for Consumer');
        done();
      };

      fixture(`<${tag}></${tag}>`);
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

    it('does not throw an error if class already have own lifecycle element', () => {
      const {consumer, provider, value} = createContext();

      expect(() => {
        @provider
        // @ts-ignore
        class Provider extends CustomElement {
          @value
          public providingValue: number = 2;

          public constructor() {
            super();
            this.connectedCallback = this.disconnectedCallback.bind(this);
            this.disconnectedCallback = this.connectedCallback.bind(this);
          }

          public connectedCallback(): void {} // tslint:disable-line:no-empty

          public disconnectedCallback(): void {} // tslint:disable-line:no-empty
        }
      }).not.toThrow();

      expect(() => {
        @consumer
        // @ts-ignore
        class Consumer extends CustomElement {
          @value
          public contextValue!: number;

          public constructor() {
            super();
            this.connectedCallback = this.disconnectedCallback.bind(this);
            this.disconnectedCallback = this.connectedCallback.bind(this);
          }

          public connectedCallback(): void {} // tslint:disable-line:no-empty

          public disconnectedCallback(): void {} // tslint:disable-line:no-empty
        }
      }).not.toThrow();
    });
  });
});
