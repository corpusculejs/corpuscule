import {consumer, value} from '@corpuscule/context';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import getSupers from '@corpuscule/utils/lib/getSupers';
import {setObject} from '@corpuscule/utils/lib/setters';
import {tokenRegistry} from './utils';

// eslint-disable-next-line no-empty-function
const noop = () => {};

const redux = token => target => {
  let units;

  const {prototype} = target;

  const $$contextProperty = Symbol();
  const $$unsubscribe = Symbol();

  const supers = getSupers(prototype, ['disconnectedCallback']);

  const valueDescriptor = value(token)(prototype, $$contextProperty);

  setObject(tokenRegistry.get(token), target, {
    store: $$contextProperty,
    units: [],
  });

  target.__registrations.push(() => {
    ({units} = tokenRegistry.get(token).get(target));
  });

  defineExtendable(
    target,
    {
      disconnectedCallback() {
        supers.disconnectedCallback.call(this);
        this[$$unsubscribe]();
      },
    },
    supers,
    target.__initializers,
  );

  Object.defineProperty(prototype, $$contextProperty, {
    ...valueDescriptor,
    get: valueDescriptor.get,
    set(newValue) {
      valueDescriptor.set.call(this, newValue);

      if (units.length !== 0) {
        this[$$unsubscribe]();

        const update = () =>
          units.forEach(callback => callback(this, this[$$contextProperty].getState()));

        update();
        this[$$unsubscribe] = this[$$contextProperty].subscribe(update);
      }
    },
  });

  prototype[$$unsubscribe] = noop;

  consumer(token)(target);
};

export default redux;
