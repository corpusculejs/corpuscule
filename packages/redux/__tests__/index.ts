// tslint:disable:max-classes-per-file
import {AnyAction, Store} from 'redux';
import {createSimpleContext, CustomElement} from '../../../test/utils';
import {dispatcher, gear, provider, redux, unit} from '../src';

describe('@corpuscule/redux', () => {
  let reduxState: {test: number};
  let reduxStore: jasmine.SpyObj<Store>;
  let unsubscribe: jasmine.Spy;

  beforeEach(() => {
    reduxState = {test: 10};
    unsubscribe = jasmine.createSpy('unsubscribe');
    reduxStore = jasmine.createSpyObj('store', ['dispatch', 'getState', 'subscribe']);
    reduxStore.subscribe.and.returnValue(unsubscribe);

    // callFake allows to change reduxState during the test
    reduxStore.getState.and.callFake(() => reduxState);
  });

  describe('@redux', () => {
    it('creates element that subscribes to a store', async () => {
      @provider
      class Provider extends CustomElement {
        @gear public store: Store = reduxStore;
      }

      @redux
      class Connected extends CustomElement {
        @unit(store => store)
        public readonly store!: Store;
      }

      await createSimpleContext(Provider, Connected);

      expect(reduxStore.subscribe).toHaveBeenCalled();
    });

    it('unsubscribes from store before subscribing to a new one', async () => {
      @provider
      class Provider extends CustomElement {
        @gear public store: Store = reduxStore;
      }

      @redux
      class Connected extends CustomElement {
        @unit(store => store)
        public readonly store!: Store;
      }

      const nextStore = jasmine.createSpyObj('nextStore', ['getState', 'subscribe']);
      nextStore.getState.and.returnValue(reduxState);
      nextStore.subscribe.and.returnValue(unsubscribe);

      const [providerElement] = await createSimpleContext(Provider, Connected);

      expect(unsubscribe).not.toHaveBeenCalled();

      providerElement.store = nextStore;

      expect(unsubscribe).toHaveBeenCalled();
      expect(nextStore.subscribe).toHaveBeenCalled();
    });

    it('unsubscribes on disconnect', async () => {
      @provider
      class Provider extends CustomElement {
        @gear public store: Store = reduxStore;
      }

      @redux
      class Connected extends CustomElement {
        @unit(store => store)
        public readonly store!: Store;
      }

      const [, connectedElement] = await createSimpleContext(Provider, Connected);

      connectedElement.disconnectedCallback();

      expect(unsubscribe).toHaveBeenCalled();
    });

    it('does nothing during update if no @unit is defined', async () => {
      @provider
      class Provider extends CustomElement {
        @gear public store: Store = reduxStore;
      }

      @redux
      class Connected extends CustomElement {}

      await createSimpleContext(Provider, Connected);

      expect(reduxStore.getState).not.toHaveBeenCalled();
    });

    it('receives store before user-defined connectedCallback is run', async () => {
      const connectedCallbackSpy = jasmine.createSpy('connectedCallback');

      @provider
      class Provider extends CustomElement {
        @gear public store: Store = reduxStore;
      }

      @redux
      class Connected extends CustomElement {
        @unit((state: typeof reduxState) => state.test)
        public test?: number;

        public connectedCallback(): void {
          connectedCallbackSpy(this.test);
        }
      }

      await createSimpleContext(Provider, Connected);

      expect(connectedCallbackSpy).toHaveBeenCalledWith(10);
    });
  });

  describe('@unit', () => {
    it('allows to declare properties connected with store', async () => {
      @provider
      class Provider extends CustomElement {
        @gear public store: Store = reduxStore;
      }

      @redux
      class Connected extends CustomElement {
        @unit((state: typeof reduxState) => state.test)
        public test?: number;
      }

      const [, connectedElement] = await createSimpleContext(Provider, Connected);

      expect(reduxStore.getState).toHaveBeenCalled();
      expect(connectedElement.test).toBe(10);
    });

    it('updates properties when store is updated', async () => {
      @provider
      class Provider extends CustomElement {
        @gear public store: Store = reduxStore;
      }

      @redux
      class Connected extends CustomElement {
        @unit((state: typeof reduxState) => state.test)
        public test?: number;
      }

      const [, connectedElement] = await createSimpleContext(Provider, Connected);

      const [subscription] = reduxStore.subscribe.calls.argsFor(0);
      reduxState = {test: 20};
      subscription();

      expect(connectedElement.test).toBe(20);
    });

    it('avoids property update if new value is equal to old one', async () => {
      const setterSpy = jasmine.createSpy('setter');

      @provider
      class Provider extends CustomElement {
        @gear public store: Store = reduxStore;
      }

      @redux
      class Connected extends CustomElement {
        public testValue!: number;

        @unit((state: typeof reduxState) => state.test)
        public get test(): number {
          return this.testValue;
        }

        public set test(value: number) {
          setterSpy();
          this.testValue = value;
        }
      }

      await createSimpleContext(Provider, Connected);
      setterSpy.calls.reset();

      const [subscription] = reduxStore.subscribe.calls.argsFor(0);
      reduxState = {test: 10};
      subscription();

      expect(setterSpy).not.toHaveBeenCalled();
    });
  });

  describe('@dispatcher', () => {
    it('allows to define dispatchers', async () => {
      const externalActionCreator = (arg: number): AnyAction => ({
        arg,
        type: 'external',
      });

      @provider
      class Provider extends CustomElement {
        @gear public store: Store = reduxStore;
      }

      @redux
      class Connected extends CustomElement {
        @dispatcher
        public external: typeof externalActionCreator = externalActionCreator;

        private readonly str: string = 'test';

        @dispatcher
        public test(num: number): AnyAction {
          return {
            num,
            str: this.str,
            type: 'test',
          };
        }
      }

      const [, connectedElement] = await createSimpleContext(Provider, Connected);

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
