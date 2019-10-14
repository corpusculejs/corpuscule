import {defineCE, fixture} from '@open-wc/testing-helpers';
import {createSimpleContext, CustomElement} from '../../../test/utils';
import {
  consumer as basicConsumer,
  createContextToken,
  isProvider,
  provider as basicProvider,
  value as basicValue,
} from '../src';

describe('@corpuscule/context', () => {
  let consumer;
  let provider;
  let token;
  let value;

  beforeEach(() => {
    token = createContextToken();
    consumer = basicConsumer(token);
    provider = basicProvider(token);
    value = basicValue(token);
  });

  it('creates context', async () => {
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
    provider = basicProvider(token, 2);

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
    provider = basicProvider(token, 2);

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
    provider = basicProvider(token, 2);

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
    @provider
    class Provider extends CustomElement {
      @value public providingValue: number = 2;
    }

    @consumer
    class Consumer extends CustomElement {
      @value public contextValue!: number;
    }

    expect(isProvider(token, Provider)).toBeTruthy();
    expect(isProvider(token, Consumer)).not.toBeTruthy();
  });

  it('sends undefined if there is not value set', async () => {
    @provider
    class Provider extends CustomElement {
      @value public providingValue: undefined;
    }

    @consumer
    class Consumer extends CustomElement {
      @value public contextValue: undefined;
    }

    const [, consumerElement] = await createSimpleContext(Provider, Consumer);
    expect(consumerElement.contextValue).toBeUndefined();
  });

  it('throws an error if no provider exists for context', done => {
    @consumer
    class Consumer extends CustomElement {
      @value public contextValue!: number;
    }

    const tag = defineCE(Consumer);

    window.onerror = message => {
      expect(message).toContain('No provider found for Consumer');
      done();
    };

    fixture(`<${tag}></${tag}>`);
  });

  it('throws an error if no value is marked with @value', () => {
    expect(() => {
      @provider
      // @ts-ignore
      class Provider extends CustomElement {}
    }).toThrowError('@provider requires any property marked with @value');

    expect(() => {
      @consumer
      // @ts-ignore
      class Consumer extends CustomElement {}
    }).toThrowError('@consumer requires any property marked with @value');
  });

  it('does not throw an error if class already have own lifecycle element', () => {
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
