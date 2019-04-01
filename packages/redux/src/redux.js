import {consumer, value} from '@corpuscule/context';
import getSupers from '@corpuscule/utils/lib/getSupers';
import {setObject} from '@corpuscule/utils/lib/setters';
import {tokenRegistry} from './utils';

const redux = token => target => {
  let units;

  const {prototype} = target;

  const $$contextProperty = Symbol();
  const $$disconnectedCallback = Symbol();
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

  Object.assign(prototype, {
    disconnectedCallback() {
      this[$$disconnectedCallback]();
    },
    // eslint-disable-next-line sort-keys
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

  target.__initializers.push(self => {
    // Inheritance workaround. If class is inherited, method will work in a different way
    const isExtended = self.constructor !== target;

    Object.assign(self, {
      [$$disconnectedCallback]: isExtended
        ? supers.disconnectedCallback
        : () => {
            supers.disconnectedCallback.call(self);

            if (self[$$unsubscribe]) {
              self[$$unsubscribe]();
            }
          },
    });
  });

  consumer(token)(target);
};

export default redux;
