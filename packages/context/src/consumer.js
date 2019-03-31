import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import {getSupers, tokenRegistry} from './utils';

const consumer = token => target => {
  let $value;

  const $$connectedCallback = Symbol();
  const $$consume = Symbol();
  const $$disconnectedCallback = Symbol();
  const $$unsubscribe = Symbol();

  const supers = getSupers(target);

  const [eventName, values] = tokenRegistry.get(token);

  target.__registrations.push(() => {
    ({value: $value} = values.get(target) || {});
    assertRequiredProperty('consumer', 'value', $value);
  });

  Object.assign(target.prototype, {
    connectedCallback() {
      this[$$connectedCallback]();
    },
    disconnectedCallback() {
      this[$$disconnectedCallback]();
    },
  });

  target.__initializers.push(self => {
    // Inheritance workaround. If class is inherited, method will work in a different way
    const isExtended = self.constructor !== target;

    Object.assign(self, {
      [$$connectedCallback]: isExtended
        ? supers.connectedCallback
        : () => {
            const event = new CustomEvent(eventName, {
              bubbles: true,
              cancelable: true,
              composed: true,
              detail: {consume: self[$$consume]},
            });

            self.dispatchEvent(event);

            self[$$unsubscribe] = event.detail.unsubscribe;

            if (!self[$$unsubscribe]) {
              throw new Error(`No provider found for ${self.constructor.name}`);
            }

            supers.connectedCallback.call(self);
          },
      [$$consume](v) {
        self[$value] = v;
      },
      [$$disconnectedCallback]: isExtended
        ? supers.disconnectedCallback
        : () => {
            if (self[$$unsubscribe]) {
              self[$$unsubscribe](self[$$consume]);
            }

            supers.disconnectedCallback.call(self);
          },
    });
  });
};

export default consumer;
