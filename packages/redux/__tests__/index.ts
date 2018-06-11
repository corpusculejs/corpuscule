// tslint:disable:max-classes-per-file
import {AnyAction, Store} from "redux";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {BasicConsumer, BasicProvider, defineAndMountContext} from "../../../test/utils";
import {
  connect,
  connectedMap,
  ConnectedMap,
  dispatcherMap,
  DispatcherRegistry,
  provider,
  store,
} from "../src";

describe("@corpuscule/redux", () => {
  let reduxState: {test: number};
  let reduxStore: jasmine.SpyObj<Store>;
  let unsubscribe: jasmine.Spy;

  beforeEach(() => {
    reduxState = {test: 10};
    unsubscribe = jasmine.createSpy("unsubscribe");
    reduxStore = jasmine.createSpyObj("store", ["dispatch", "getState", "subscribe"]);
    reduxStore.subscribe.and.returnValue(unsubscribe);
    reduxStore.getState.and.callFake(() => reduxState);
  });

  it("should subscribe to store", () => {
    @provider
    class Provider extends BasicProvider {
      public static is: string = `x-${uuid()}`;

      protected [store]: Store = reduxStore;
    }

    @connect
    class Connected extends BasicConsumer {
      public static is: string = `x-${uuid()}`;
    }

    defineAndMountContext(Provider, Connected);
    expect(reduxStore.subscribe).toHaveBeenCalled();
  });

  it("should allow to declare properties bound with store", () => {
    @provider
    class Provider extends BasicProvider {
      public static is: string = `x-${uuid()}`;

      protected [store]: Store = reduxStore;
    }

    @connect
    class Connected extends BasicConsumer {
      public static is: string = `x-${uuid()}`;

      protected static get [connectedMap](): ConnectedMap<typeof reduxState> {
        return {
          test: state => state.test,
        };
      }

      public test?: number;
    }

    const [, c] = defineAndMountContext(Provider, Connected);

    expect(reduxStore.getState).toHaveBeenCalled();
    expect(c.test).toBe(10);
  });

  it("should update properties when store is updated", () => {
    @provider
    class Provider extends BasicProvider {
      public static is: string = `x-${uuid()}`;

      protected [store]: Store = reduxStore;
    }

    @connect
    class Connected extends BasicConsumer {
      public static is: string = `x-${uuid()}`;

      protected static get [connectedMap](): ConnectedMap<typeof reduxState> {
        return {
          test: state => state.test,
        };
      }

      public test?: number;
    }

    const [, c] = defineAndMountContext(Provider, Connected);

    const [subscription] = reduxStore.subscribe.calls.argsFor(0);
    reduxState = {test: 20};
    subscription();

    expect(c.test).toBe(20);
  });

  it("should unsubscribe from store before subscribing to a new one", () => {
    @provider
    class Provider extends BasicProvider {
      public static is: string = `x-${uuid()}`;

      protected [store]: Store = reduxStore;
    }

    @connect
    class Connected extends BasicConsumer {
      public static is: string = `x-${uuid()}`;
    }

    const nextStore = jasmine.createSpyObj("nextStore", ["subscribe"]);

    const [p] = defineAndMountContext(Provider, Connected);

    expect(unsubscribe).not.toHaveBeenCalled();

    p[store] = nextStore;

    expect(unsubscribe).toHaveBeenCalled();
    expect(nextStore.subscribe).toHaveBeenCalled();
  });

  it("should allow to define dispatchers", () => {
    const externalActionCreator = (arg: number): AnyAction => ({
      arg,
      type: "external",
    });

    @provider
    class Provider extends BasicProvider {
      public static is: string = `x-${uuid()}`;

      protected [store]: Store = reduxStore;
    }

    @connect
    class Connected extends BasicConsumer {
      public static is: string = `x-${uuid()}`;

      protected static get [dispatcherMap](): DispatcherRegistry {
        return ["external", "test"];
      }

      public external: typeof externalActionCreator = externalActionCreator;

      private str: string = "test";

      public test(num: number): AnyAction {
        return {
          num,
          str: this.str,
          type: "test",
        };
      }
    }

    const [, c] = defineAndMountContext(Provider, Connected);

    c.external(20);
    c.test(10);

    expect(reduxStore.dispatch).toHaveBeenCalledWith({
      arg: 20,
      type: "external",
    });

    expect(reduxStore.dispatch).toHaveBeenCalledWith({
      num: 10,
      str: "test",
      type: "test",
    });
  });
});
