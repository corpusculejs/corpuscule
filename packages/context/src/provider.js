import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import {setObject} from '@corpuscule/utils/lib/setters';
import {getSupers, tokenRegistry} from './utils';

const provider = (token, defaultValue) => target => {
  let $value;

  const {prototype} = target;

  const $$consumers = Symbol();
  const $$subscribe = Symbol();
  const $$unsubscribe = Symbol();

  const supers = getSupers(prototype);

  const [eventName, values, providers] = tokenRegistry.get(token);

  providers.add(target);

  setObject(values, target, {
    consumers: $$consumers,
  });

  target.__registrations.push(() => {
    ({value: $value} = values.get(target));
    assertRequiredProperty('provider', 'value', $value);
  });

  defineExtendable(
    target,
    {
      connectedCallback() {
        this.addEventListener(eventName, this[$$subscribe]);
        supers.connectedCallback.call(this);
      },
      disconnectedCallback() {
        this.removeEventListener(eventName, this[$$subscribe]);
        supers.disconnectedCallback.call(this);
      },
    },
    supers,
    target.__initializers,
  );

  target.__initializers.push(self => {
    Object.assign(self, {
      [$$consumers]: [],
      [$$subscribe](event) {
        const {consume} = event.detail;

        self[$$consumers].push(consume);
        consume(self[$value]);

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
