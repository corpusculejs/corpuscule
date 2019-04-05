import {consumer, value} from '@corpuscule/context';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import getSupers from '@corpuscule/utils/lib/getSupers';
import {setObject} from '@corpuscule/utils/lib/setters';
import {tokenRegistry} from './utils';

const redux = token => target => {
  let units;

  const {prototype} = target;

  const $$contextProperty = Symbol();
  const $$subscribe = Symbol();
  const $$unsubscribe = Symbol();
  const $$update = Symbol();

  const supers = getSupers(prototype, ['disconnectedCallback']);

  const valueDescriptor = value(token)(prototype, $$contextProperty);

  setObject(tokenRegistry.get(token), target, {
    store: $$contextProperty,
    units: new Map(),
  });

  target.__registrations.push(() => {
    ({units} = tokenRegistry.get(token).get(target));
  });

  defineExtendable(
    target,
    {
      disconnectedCallback() {
        supers.disconnectedCallback.call(this);

        if (this[$$unsubscribe]) {
          this[$$unsubscribe]();
        }
      },
    },
    supers,
    target.__initializers,
  );

  Object.assign(prototype, {
    [$$subscribe]() {
      const context = this[$$contextProperty];
      this[$$update](context);

      this[$$unsubscribe] = context.subscribe(() => {
        this[$$update](context);
      });
    },
    [$$update]({getState}) {
      if (units.size === 0) {
        return;
      }

      const state = getState();

      for (const [key, getter] of units) {
        const v = getter(state);

        if (v !== this[key]) {
          this[key] = v;
        }
      }
    },
  });

  Object.defineProperties(prototype, {
    [$$contextProperty]: {
      ...valueDescriptor,
      get: valueDescriptor.get,
      set(v) {
        valueDescriptor.set.call(this, v);

        if (this[$$unsubscribe]) {
          this[$$unsubscribe]();
        }

        this[$$subscribe]();
      },
    },
  });

  consumer(token)(target);
};

export default redux;
