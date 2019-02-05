// tslint:disable:max-classes-per-file
import {AnyAction, Store} from 'redux';
import {createMockedContextElements, valuesMap} from '../../../test/mocks/context';
import {CustomElement, genName} from '../../../test/utils';
import {api, dispatcher, provider, redux, unit} from '../src';

describe('@corpuscule/redux', () => {
  let reduxState: {test: number};
  let reduxStore: jasmine.SpyObj<Store>;
  let unsubscribe: jasmine.Spy;

  beforeEach(() => {
    reduxState = {test: 10};
    unsubscribe = jasmine.createSpy('unsubscribe');
    reduxStore = jasmine.createSpyObj('store', ['dispatch', 'getState', 'subscribe']);
    reduxStore.subscribe.and.returnValue(unsubscribe);
    reduxStore.getState.and.callFake(() => reduxState);
  });

  describe('@redux', () => {
    it('subscribes to store', () => {
      @provider
      class Provider extends CustomElement {
        @api public store: Store = reduxStore;
      }

      @redux
      class Connected extends CustomElement {}

      createMockedContextElements(Provider, Connected);

      expect(reduxStore.subscribe).toHaveBeenCalled();
    });

    it('unsubscribes from store before subscribing to a new one', () => {
      @provider
      class Provider extends CustomElement {
        @api public store: Store = reduxStore;
      }

      @redux
      class Connected extends CustomElement {}

      const nextStore = jasmine.createSpyObj('nextStore', ['getState', 'subscribe']);

      const [providerElement] = createMockedContextElements(Provider, Connected);

      expect(unsubscribe).not.toHaveBeenCalled();

      providerElement.store = nextStore;

      expect(unsubscribe).toHaveBeenCalled();
      expect(nextStore.subscribe).toHaveBeenCalled();
    });

    it('unsubscribes on disconnect', () => {
      @provider
      class Provider extends CustomElement {
        @api public store: Store = reduxStore;
      }

      @redux
      class Connected extends CustomElement {}

      const [, connectedElement] = createMockedContextElements(Provider, Connected);

      connectedElement.disconnectedCallback();

      expect(unsubscribe).toHaveBeenCalled();
    });

    it('does nothing during update if no @unit is defined', () => {
      @provider
      class Provider extends CustomElement {
        @api public store: Store = reduxStore;
      }

      @redux
      class Connected extends CustomElement {}

      createMockedContextElements(Provider, Connected);

      expect(reduxStore.getState).not.toHaveBeenCalled();
    });

    it('does not throw an error if class already have own lifecycle element', () => {
      expect(() => {
        @redux
        // @ts-ignore
        class Connected extends CustomElement {
          public constructor() {
            super();
            this.disconnectedCallback = this.disconnectedCallback.bind(this);
          }

          public disconnectedCallback(): void {} // tslint:disable-line:no-empty
        }
      }).not.toThrow();
    });

    it('executes disconnectedCallback on real DOM', async () => {
      const disconnectedCallbackSpy = jasmine.createSpy('disconnectedCallback');

      @redux
      class Connected extends HTMLElement {
        public disconnectedCallback(): void {
          disconnectedCallbackSpy();
        }
      }

      customElements.define(genName(), Connected);

      const connectedElement = new Connected();

      document.body.appendChild(connectedElement);
      const contextValue = valuesMap.get(Connected)!;
      (connectedElement as any)[contextValue] = reduxStore;

      document.body.removeChild(connectedElement);

      expect(disconnectedCallbackSpy).toHaveBeenCalled();
      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe('@unit', () => {
    it('allows to declare properties connected with store', () => {
      @provider
      class Provider extends CustomElement {
        @api public store: Store = reduxStore;
      }

      @redux
      class Connected extends CustomElement {
        @unit((state: typeof reduxState) => state.test)
        public test?: number;
      }

      const [, connectedElement] = createMockedContextElements(Provider, Connected);

      expect(reduxStore.getState).toHaveBeenCalled();
      expect(connectedElement.test).toBe(10);
    });

    it('updates properties when store is updated', () => {
      @provider
      class Provider extends CustomElement {
        @api public store: Store = reduxStore;
      }

      @redux
      class Connected extends CustomElement {
        @unit((state: typeof reduxState) => state.test)
        public test?: number;
      }

      const [, connectedElement] = createMockedContextElements(Provider, Connected);

      const [subscription] = reduxStore.subscribe.calls.argsFor(0);
      reduxState = {test: 20};
      subscription();

      expect(connectedElement.test).toBe(20);
    });

    it('avoids property update if new value is equal to old one', () => {
      const setterSpy = jasmine.createSpy('setter');

      @provider
      class Provider extends CustomElement {
        @api public store: Store = reduxStore;
      }

      @redux
      class Connected extends CustomElement {
        public testValue: number = 10;

        @unit((state: typeof reduxState) => state.test)
        public get test(): number {
          return this.testValue;
        }

        public set test(value: number) {
          setterSpy();
          this.testValue = value;
        }
      }

      createMockedContextElements(Provider, Connected);

      const [subscription] = reduxStore.subscribe.calls.argsFor(0);
      reduxState = {test: 10};
      subscription();

      expect(setterSpy).not.toHaveBeenCalled();
    });
  });

  describe('@dispatcher', () => {
    it('allows to define dispatchers', () => {
      const externalActionCreator = (arg: number): AnyAction => ({
        arg,
        type: 'external',
      });

      @provider
      class Provider extends CustomElement {
        @api public store: Store = reduxStore;
      }

      @redux
      class Connected extends CustomElement {
        @dispatcher
        public external: typeof externalActionCreator = externalActionCreator;

        private str: string = 'test';

        @dispatcher
        public test(num: number): AnyAction {
          return {
            num,
            str: this.str,
            type: 'test',
          };
        }
      }

      const [, connectedElement] = createMockedContextElements(Provider, Connected);

      connectedElement.external(20);
      connectedElement.test(10);

      expect(reduxStore.dispatch).toHaveBeenCalledWith({
        arg: 20,
        type: 'external',
      });

      expect(reduxStore.dispatch).toHaveBeenCalledWith({
        num: 10,
        str: 'test',
        type: 'test',
      });
    });

    it('throws an error if dispatcher property is not a method or assigned function', () => {
      expect(() => {
        // @ts-ignore
        class Connected extends CustomElement {
          @dispatcher
          public external: number = 1;
        }
      }).toThrow(new TypeError('@dispatcher "external" should be initialized with a function'));

      expect(() => {
        // @ts-ignore
        class Connected extends CustomElement {
          @dispatcher
          public nothing?: unknown;
        }
      }).toThrow(new TypeError('@dispatcher "nothing" should be initialized with a function'));
    });
  });
});
