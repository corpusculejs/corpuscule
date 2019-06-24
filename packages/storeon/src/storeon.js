import {consumer, value} from '@corpuscule/context';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import reflectClassMethods from '@corpuscule/utils/lib/reflectClassMethods';
import {setObject} from '@corpuscule/utils/lib/setters';
import {tokenRegistry} from './utils';

// eslint-disable-next-line no-empty-function
const noop = () => {};

const storeon = token => target => {
  let units;

  const {prototype} = target;

  const $$contextProperty = Symbol();
  const $$unsubscribe = Symbol();

  const supers = reflectClassMethods(prototype, ['disconnectedCallback']);

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

  // eslint-disable-next-line accessor-pairs
  Object.defineProperty(prototype, $$contextProperty, {
    ...valueDescriptor,
    set(v) {
      valueDescriptor.set.call(this, v);

      if (units.length !== 0) {
        this[$$unsubscribe]();

        units.forEach(callback => callback(this, this[$$contextProperty].get()));

        this[$$unsubscribe] = this[$$contextProperty].on('@changed', (_, changed) => {
          units.forEach(callback => callback(this, changed));
        });
      }
    },
  });

  prototype[$$unsubscribe] = noop;

  consumer(token)(target);
};

export default storeon;
