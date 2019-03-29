import {consumer, value} from '@corpuscule/context';
import define, {defaultDescriptor} from '@corpuscule/utils/lib/define';
import getSupers from '@corpuscule/utils/lib/getSupersNew';
import {getValue, setValue} from '@corpuscule/utils/lib/propertyUtils';
import {setObject} from '@corpuscule/utils/lib/setters';
import {tokenRegistry} from './utils';

const redux = token => target => {
  let units;

  const $$contextProperty = Symbol();
  const $$disconnectedCallback = Symbol();
  const $$subscribe = Symbol();
  const $$unsubscribe = Symbol();
  const $$update = Symbol();

  const supers = getSupers(target, ['disconnectedCallback']);

  const valueDescriptor = value(token)(target.prototype, $$contextProperty, {
    ...defaultDescriptor,
    writable: true,
  });

  setObject(tokenRegistry.get(token), target, {
    store: $$contextProperty,
    units: new Map(),
  });

  target.__registrations.push(() => {
    ({units} = tokenRegistry.get(token).get(target));
  });

  define(target.prototype, {
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

        if (v !== getValue(this, key)) {
          setValue(this, key, v);
        }
      }
    },
  });

  define.raw(target.prototype, {
    [$$contextProperty]: {
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

    define(self, {
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
