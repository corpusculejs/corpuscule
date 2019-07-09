import {consumer, value} from '@corpuscule/context';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import reflectClassMethods from '@corpuscule/utils/lib/reflectClassMethods';
import {setObject} from '@corpuscule/utils/lib/setters';
import {tokenRegistry} from './utils';

// eslint-disable-next-line no-empty-function
const noop = () => {};

const redux = token => klass => {
  let units;

  const {prototype} = klass;

  const $$contextProperty = Symbol();
  const $$unsubscribe = Symbol();

  const supers = reflectClassMethods(prototype, ['disconnectedCallback']);

  const valueDescriptor = value(token)(prototype, $$contextProperty);

  setObject(tokenRegistry.get(token), klass, {
    store: $$contextProperty,
    units: [],
  });

  klass.__registrations.push(() => {
    ({units} = tokenRegistry.get(token).get(klass));
  });

  defineExtendable(
    klass,
    {
      disconnectedCallback() {
        supers.disconnectedCallback.call(this);
        this[$$unsubscribe]();
      },
    },
    supers,
    klass.__initializers,
  );

  // eslint-disable-next-line accessor-pairs
  Object.defineProperty(prototype, $$contextProperty, {
    ...valueDescriptor,
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

  consumer(token)(klass);
};

export default redux;
