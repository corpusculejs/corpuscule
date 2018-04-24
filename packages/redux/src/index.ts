// tslint:disable:no-invalid-this
import {Action, Store, Unsubscribe} from 'redux';
import {
  DispatcherDecorator,
  PropertyGetter,
  ReduxMixin,
  StoredDecorator
} from './types';

const createReduxMixin =
  <S, A extends Action>(store: Store<S, A>): [
    ReduxMixin,
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

  const withRedux: ReduxMixin = base =>
    class WithRedux extends base {
      private __unsubscribe?: Unsubscribe;

      public connectedCallback(): void {
        const map = getters.get(this.constructor.prototype);

        if (map) {
          this.__updateStoredProperties(map);

          this.__unsubscribe = store.subscribe(() => {
            this.__updateStoredProperties(map);
          });
        }

        if (super.connectedCallback) {
          super.connectedCallback();
        }
      }

      public disconnectedCallback(): void {
        if (this.__unsubscribe) {
          this.__unsubscribe();
        }

        if (super.disconnectedCallback) {
          super.disconnectedCallback();
        }
      }

      private __updateStoredProperties(map: Map<string, PropertyGetter<S>>): void {
        for (const [property, getter] of map) {
          const nextValue = getter(store.getState());

          if (nextValue !== (this as any)[property]) {
            (this as any)[property] = nextValue;
          }
        }
      }
    };


  return [withRedux, Stored, Dispatcher];
};

export default createReduxMixin;
