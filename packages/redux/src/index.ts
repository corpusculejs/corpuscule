// tslint:disable:no-invalid-this
import {Action, Store} from 'redux';
import {PropertyGetter} from './types';
import {initDispatchers, updateStoredProperties} from './utils';

const redux = <S, A extends Action>(store: Store<S, A>) => <T = any>(target: any): T => {
  const {
    connectedCallback: superConnectedCallback,
    disconnectedCallback: superDisconnectedCallback,
  } = target.prototype;

  if (target._dispatchers) {
    initDispatchers(target, store, target._dispatchers);
  }

  if (target._stored) {
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

export default redux;
