import {defineCE, fixture} from '@open-wc/testing-helpers';
import {createSimpleContext, CustomElement} from '../../../test/utils';
import createContext from '../src';

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

      const [, consumerElement] = await createSimpleContext(Provider, Consumer);

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

      const [providerElement, consumerElement] = await createSimpleContext(Provider, Consumer);

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

      const [providerElement, consumerElement] = await createSimpleContext(Provider, Consumer);

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

      const [providerElement, consumerElement] = await createSimpleContext(Provider, Consumer);

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

      const [providerElement, consumerElement] = await createSimpleContext(Provider, Consumer);

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

      await createSimpleContext(Provider, Consumer);

      expect(constructorSpy).toHaveBeenCalled();
    });

    it('allows to use accessors for a value', async () => {
      const {consumer, provider, value} = createContext();

      @provider
      class Provider extends CustomElement {
        public storage: number = 10;

        @value
        public get providingValue(): number {
          return this.storage;
        }

        public set providingValue(v: number) {
          this.storage = v;
        }
      }

      @consumer
      class Consumer extends CustomElement {
        public storage!: number;

        @value
        public get contextValue(): number {
          return this.storage;
        }

        public set contextValue(v: number) {
          this.storage = v;
        }
      }

      const [providerElement, consumerElement] = await createSimpleContext(Provider, Consumer);

      expect(providerElement.providingValue).toBe(10);
      expect(consumerElement.contextValue).toBe(10);
    });

    it('sets default value for provider value with accessors if it is not defined', async () => {
      const {consumer, provider, value} = createContext(2);

      @provider
      class Provider extends CustomElement {
        public storage!: number;

        @value
        public get providingValue(): number {
          return this.storage;
        }

        public set providingValue(v: number) {
          this.storage = v;
        }
      }

      @consumer
      class Consumer extends CustomElement {
        public storage!: number;

        @value
        public get contextValue(): number {
          return this.storage;
        }

        public set contextValue(v: number) {
          this.storage = v;
        }
      }

      const [providerElement, consumerElement] = await createSimpleContext(Provider, Consumer);

      expect(providerElement.providingValue).toBe(2);
      expect(consumerElement.contextValue).toBe(2);
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
