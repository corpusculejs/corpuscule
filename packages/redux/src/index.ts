// tslint:disable:no-invalid-this
import {Action, Store, Unsubscribe} from 'redux';
import {PropertyGetter, ReduxConstructor} from './types';
import {initDispatchers, updateStoredProperties} from './utils';

const withRedux =
  <S, A extends Action>(store: Store<S, A>) =>
    <T extends ReduxConstructor<S>>(target: T): T => {
      if (target._dispatchers) {
        initDispatchers(target, store, target._dispatchers);
      }

      if (target._stored) {
        const registry: ReadonlyArray<[string, PropertyGetter<S>]> = Object.entries(target._stored);

        return class WithRedux extends target {
          private __unsubscribe?: Unsubscribe;

          public connectedCallback(): void {
            updateStoredProperties(this, store, registry);

            this.__unsubscribe = store.subscribe(() => {
              updateStoredProperties(this, store, registry);
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

export default withRedux;
