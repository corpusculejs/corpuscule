import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import {getSupers, tokenRegistry} from './utils';

const consumer = token => target => {
  let $value;

  const {prototype} = target;

  const $$consume = Symbol();
  const $$unsubscribe = Symbol();

  const supers = getSupers(prototype);

  const [eventName, values] = tokenRegistry.get(token);

  target.__registrations.push(() => {
    ({value: $value} = values.get(target) || {});
    assertRequiredProperty('consumer', 'value', $value);
  });

  defineExtendable(
    target,
    {
      connectedCallback() {
        const event = new CustomEvent(eventName, {
          bubbles: true,
          cancelable: true,
          composed: true,
          detail: {consume: this[$$consume]},
        });

        this.dispatchEvent(event);

        this[$$unsubscribe] = event.detail.unsubscribe;

        if (!this[$$unsubscribe]) {
          throw new Error(`No provider found for ${this.constructor.name}`);
        }

        supers.connectedCallback.call(this);
      },
      disconnectedCallback() {
        if (this[$$unsubscribe]) {
          this[$$unsubscribe](this[$$consume]);
        }

        supers.disconnectedCallback.call(this);
      },
    },
    supers,
  );

  target.__initializers.push(self => {
    self[$$consume] = v => {
      self[$value] = v;
    };
  });
};

export default consumer;
