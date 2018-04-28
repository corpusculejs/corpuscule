// tslint:disable:no-invalid-this
import {Action, Store, Unsubscribe} from 'redux';
import {
  DispatcherDecorator,
  PropertyGetter,
  ReduxDecorator,
  StoredDecorator
} from './types';

const createReduxBindings =
  <S, A extends Action>(store: Store<S, A>): [
    ReduxDecorator,
    StoredDecorator<S>,
    DispatcherDecorator
  ] => {
  const getters = new WeakMap<any, Map<string, PropertyGetter<S>>>();

  const Stored: StoredDecorator<S> = getter => (prototype, propertyName) => {
    const map = getters.get(prototype);

    if (!map) {
      getters.set(prototype, new Map([[propertyName, getter]]));
    } else {
      map.set(propertyName, getter);
    }
  };

  const Dispatcher: DispatcherDecorator = (prototype, propertyName) => {
    const method = prototype[propertyName];

    if (!method) {
      return {
        set(this: any, value: Function): void {
          Object.defineProperty(this, propertyName, {
            value(...args: any[]): void {
              store.dispatch(value(...args));
            },
          });
        },
      };
    }

    return {
      value(...args: any[]): void {
        store.dispatch(method(...args));
      },
    };
  };

  function updateStoredProperties(this: any, map: Map<string, PropertyGetter<S>>): void {
    for (const [property, getter] of map) {
      const nextValue = getter(store.getState());

      if (nextValue !== this[property]) {
        this[property] = nextValue;
      }
    }
  }

  const Redux: ReduxDecorator = (target) => {
    const targetGetters = getters.get(target.prototype);

    if (!targetGetters) {
      return;
    }

    const unsubscribers = new WeakMap<any, Unsubscribe>();

    const {
      connectedCallback: superConnectedCallback,
      disconnectedCallback: superDisconnectedCallback,
    } = target.prototype;

    target.prototype.connectedCallback = function connectedCallback(): void {
      updateStoredProperties.call(this, targetGetters);

      unsubscribers.set(this, store.subscribe(() => {
        updateStoredProperties.call(this, targetGetters);
      }));

      if (superConnectedCallback) {
        superConnectedCallback.call(this);
      }
    };

    target.prototype.disconnectedCallback = function disconnectedCallback(): void {
      unsubscribers.get(this)!();

      if (superDisconnectedCallback) {
        superDisconnectedCallback.call(this);
      }
    };
  };

  return [Redux, Stored, Dispatcher];
};

export default createReduxBindings;
