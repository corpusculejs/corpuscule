import {Dispatch, Store} from 'storeon';
import {createSimpleContext, CustomElement} from '../../../test/utils';
import {dispatcher, gear, provider, storeon, unit} from '../src';

type State = {
  test: number;
};

type EventMap = {
  inc: number;
  inc1: number;
  inc2: number;
};

describe('@corpuscule/storeon', () => {
  let storeonState: State;
  let storeonStore: jasmine.SpyObj<Store<State, EventMap>>;
  let unsubscribe: jasmine.Spy;

  beforeEach(() => {
    storeonState = {test: 10};
    unsubscribe = jasmine.createSpy('unsubscribe');
    storeonStore = jasmine.createSpyObj('store', ['dispatch', 'get', 'on']);
    storeonStore.on.and.returnValue(unsubscribe);
    storeonStore.get.and.returnValue(storeonState);
  });

  describe('@storeon', () => {
    it('creates element that subscribes to a store', async () => {
      @provider
      class Provider extends CustomElement {
        @gear public store: Store<State> = storeonStore;
      }

      @storeon
      class Connected extends CustomElement {
        @unit<State>('test') public readonly test!: number;
      }

      await createSimpleContext(Provider, Connected);

      expect(storeonStore.on).toHaveBeenCalled();
    });

    it('unsubscribes from store before subscribing to a new one', async () => {
      @provider
      class Provider extends CustomElement {
        @gear public store: Store<State> = storeonStore;
      }

      @storeon
      class Connected extends CustomElement {
        @unit<State>('test') public readonly test!: number;
      }

      const nextStore = jasmine.createSpyObj('nextStore', ['get', 'on']);
      nextStore.get.and.returnValue(storeonState);
      nextStore.on.and.returnValue(unsubscribe);

      const [providerElement] = await createSimpleContext(Provider, Connected);

      expect(unsubscribe).not.toHaveBeenCalled();

      providerElement.store = nextStore;

      expect(unsubscribe).toHaveBeenCalled();
      expect(nextStore.on).toHaveBeenCalled();
    });

    it('unsubscribes on disconnect', async () => {
      @provider
      class Provider extends CustomElement {
        @gear public store: Store<State> = storeonStore;
      }

      @storeon
      class Connected extends CustomElement {
        @unit<State>('test') public readonly test!: number;
      }

      const [, connectedElement] = await createSimpleContext(
        Provider,
        Connected,
      );

      connectedElement.disconnectedCallback();

      expect(unsubscribe).toHaveBeenCalled();
    });

    it('does nothing during update if no @unit is defined', async () => {
      @provider
      class Provider extends CustomElement {
        @gear public store: Store<State> = storeonStore;
      }

      @storeon
      class Connected extends CustomElement {}

      await createSimpleContext(Provider, Connected);

      expect(storeonStore.get).not.toHaveBeenCalled();
      expect(storeonStore.on).not.toHaveBeenCalled();
    });

    it('receives store before user-defined connectedCallback is run', async () => {
      const connectedCallbackSpy = jasmine.createSpy('connectedCallback');

      @provider
      class Provider extends CustomElement {
        @gear public store: Store<State> = storeonStore;
      }

      @storeon
      class Connected extends CustomElement {
        @unit<State>('test') public readonly test!: number;

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
        @gear public store: Store<State> = storeonStore;
      }

      @storeon
      class Connected extends CustomElement {
        @unit<State>('test') public readonly test!: number;
      }

      const [, connectedElement] = await createSimpleContext(
        Provider,
        Connected,
      );

      expect(storeonStore.get).toHaveBeenCalled();
      expect(connectedElement.test).toBe(10);
    });

    it('updates properties when store is updated', async () => {
      @provider
      class Provider extends CustomElement {
        @gear public store: Store<State> = storeonStore;
      }

      @storeon
      class Connected extends CustomElement {
        @unit<State>('test') public readonly test!: number;
      }

      const [, connectedElement] = await createSimpleContext(
        Provider,
        Connected,
      );

      const [, handler] = storeonStore.on.calls.argsFor(0);
      handler(storeonState, {test: 20});

      expect(connectedElement.test).toBe(20);
    });

    it('avoids property update if property is not in "changed" list', async () => {
      const setterSpy = jasmine.createSpy('setter');

      @provider
      class Provider extends CustomElement {
        @gear public store: Store<State> = storeonStore;
      }

      @storeon
      class Connected extends CustomElement {
        public testValue!: number;

        @unit<State>('test')
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

      const [, subscription] = storeonStore.on.calls.argsFor(0);
      subscription(storeonState, {other: 20});

      expect(setterSpy).not.toHaveBeenCalled();
    });
  });

  describe('@dispatcher', () => {
    it('allows to define dispatchers', async () => {
      @provider
      class Provider extends CustomElement {
        @gear public store: Store<State> = storeonStore;
      }

      @storeon
      class Connected extends CustomElement {
        @dispatcher()
        public dispatch!: Dispatch<{inc: number}>;

        @dispatcher('inc1')
        public increment!: (num: number) => void;

        @dispatcher('inc2')
        public incrementMethod(...args: number[]): number {
          return args.reduce((acc, v) => acc + v, 0);
        }
      }

      const [, connectedElement] = await createSimpleContext(
        Provider,
        Connected,
      );

      connectedElement.dispatch('inc', 10);
      connectedElement.increment(20);
      connectedElement.incrementMethod(1, 2, 3, 4, 5);

      expect(storeonStore.dispatch).toHaveBeenCalledWith('inc', 10);
      expect(storeonStore.dispatch).toHaveBeenCalledWith('inc1', 20);
      expect(storeonStore.dispatch).toHaveBeenCalledWith('inc2', 15);
    });
  });
});
