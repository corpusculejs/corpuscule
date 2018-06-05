// tslint:disable:no-invalid-this
import {Action, Store, Unsubscribe} from "redux";
import {dispatcherMap, storedMap, unsubscribe} from "./tokens";
import {PropertyGetter, ReduxConstructor} from "./types";
import {initDispatchers, updateStoredProperties} from "./utils";

export {dispatcherMap, storedMap};

const createReduxConnectionUtils = () => {
  let currentStore: Store<any, any>;

  const provideReduxStore = <S, A extends Action>(store: Store<S, A>): void => {
    currentStore = store;
  };

  const connectReduxStore = <S, T extends ReduxConstructor<S>>(target: T): T => {
    if (!currentStore) {
      throw new Error("Store is not provided");
    }

    if (target[dispatcherMap]) {
      initDispatchers(target, currentStore, target[dispatcherMap]);
    }

    if (target[storedMap]) {
      const registry: ReadonlyArray<[string, PropertyGetter<S>]> = Object.entries(target[storedMap]!);

      return class WithRedux extends target {
        private [unsubscribe]?: Unsubscribe;

        public connectedCallback(): void {
          updateStoredProperties(this, currentStore, registry);

          this[unsubscribe] = currentStore.subscribe(() => {
            updateStoredProperties(this, currentStore, registry);
          });

          if (super.connectedCallback) {
            super.connectedCallback();
          }
        }

        public disconnectedCallback(): void {
          this[unsubscribe]!();

          if (super.disconnectedCallback) {
            super.disconnectedCallback();
          }
        }
      };
    }

    return target;
  };

  return {
    connect: connectReduxStore,
    provide: provideReduxStore,
  };
};

export const {
  connect,
  provide,
} = createReduxConnectionUtils();
