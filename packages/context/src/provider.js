import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import {getValue} from '@corpuscule/utils/lib/propertyUtils';
import {setObject} from '@corpuscule/utils/lib/setters';
import {getSupers, tokenRegistry} from './utils';

const provider = (token, defaultValue = null) => target => {
  let $value;
  const $$connectedCallback = Symbol();
  const $$consumers = Symbol();
  const $$disconnectedCallback = Symbol();
  const $$subscribe = Symbol();
  const $$unsubscribe = Symbol();

  const supers = getSupers(target);

  const [eventName, values, providers] = tokenRegistry.get(token);

  providers.add(target);

  setObject(values, target, {
    consumers: $$consumers,
  });

  target.__registrations.push(() => {
    ({value: $value} = values.get(target));
    assertRequiredProperty('provider', 'value', $value);
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
            self.addEventListener(eventName, self[$$subscribe]);
            supers.connectedCallback.call(self);
          },
      [$$consumers]: [],
      [$$disconnectedCallback]: isExtended
        ? supers.disconnectedCallback
        : () => {
            self.removeEventListener(eventName, self[$$subscribe]);
            supers.disconnectedCallback.call(self);
          },
      [$$subscribe](event) {
        const {consume} = event.detail;

        self[$$consumers].push(consume);
        consume(getValue(self, $value));

        event.detail.unsubscribe = self[$$unsubscribe];
        event.stopPropagation();
      },
      [$$unsubscribe](consume) {
        self[$$consumers] = self[$$consumers].filter(p => p !== consume);
      },
    });

    if (self[$value] === undefined) {
      self[$value] = defaultValue;
    }
  });
};

export default provider;
