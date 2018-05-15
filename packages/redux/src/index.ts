// tslint:disable:no-invalid-this
import {Action, Store, Unsubscribe} from 'redux';
import {PropertyGetter, ReduxConstructor} from './types';
import {initDispatchers, updateStoredProperties} from './utils';

const createReduxConnectionUtils = () => {
  let currentStore: Store<any, any>;

  const provideReduxStore = <S, A extends Action>(store: Store<S, A>): void => {
    currentStore = store;
  };

  const connectReduxStore = <S, T extends ReduxConstructor<S>>(target: T): T => {
    if (!currentStore) {
      throw new Error('Store is not provided');
    }

    if (target._dispatchers) {
      initDispatchers(target, currentStore, target._dispatchers);
    }

    if (target._stored) {
      const registry: ReadonlyArray<[string, PropertyGetter<S>]> = Object.entries(target._stored);

      return class WithRedux extends target {
        private __unsubscribe?: Unsubscribe;

        public connectedCallback(): void {
          updateStoredProperties(this, currentStore, registry);

          this.__unsubscribe = currentStore.subscribe(() => {
            updateStoredProperties(this, currentStore, registry);
          });

          if (super.connectedCallback) {
            super.connectedCallback();
          }
        }

        public disconnectedCallback(): void {
          this.__unsubscribe!();

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
