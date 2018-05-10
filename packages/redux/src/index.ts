// tslint:disable:no-invalid-this
import {Action, Store} from 'redux';
import {PropertyGetter, ReduxConstructor} from './types';
import {initDispatchers, updateStoredProperties} from './utils';

const withRedux =
  <S, A extends Action>(store: Store<S, A>) =>
    <T extends ReduxConstructor<S>>(target: T): T => {
      if (target._dispatchers) {
        initDispatchers(target, store, target._dispatchers);
      }

      if (target._stored) {
        const {
          connectedCallback: superConnectedCallback,
          disconnectedCallback: superDisconnectedCallback,
        } = target.prototype;

        const registry: ReadonlyArray<[string, PropertyGetter<S>]> = Object.entries(target._stored);

        target.prototype.connectedCallback = function connectedCallback(this: any): void {
          updateStoredProperties(this, store, registry);

          this.__unsubscribe = store.subscribe(() => {
            updateStoredProperties(this, store, registry);
          });

          if (superConnectedCallback) {
            superConnectedCallback.call(this);
          }
        };

        target.prototype.disconnectedCallback = function disconnectedCallback(this: any): void {
          this.__unsubscribe();

          if (superDisconnectedCallback) {
            superDisconnectedCallback.call(this);
          }
        };
      }

      return target;
    };

export default withRedux;
