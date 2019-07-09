import {consumer, value} from '@corpuscule/context';
import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import {tokenRegistry} from './utils';

const outlet = (token, routes) => klass => {
  let $value;

  const {prototype} = klass;
  const $$contextProperty = Symbol();
  const valueDescriptor = value(token)(prototype, $$contextProperty);

  klass.__registrations.push(() => {
    ({value: $value} = tokenRegistry.get(token).get(klass));
    assertRequiredProperty('outlet', 'gear', $value);
  });

  // eslint-disable-next-line accessor-pairs
  Object.defineProperty(prototype, $$contextProperty, {
    ...valueDescriptor,
    set(routingChain = []) {
      valueDescriptor.set.call(this, routingChain);

      for (const {result, route} of routingChain) {
        if (routes.includes(route)) {
          this[$value] = result;
          break;
        }
      }
    },
  });

  consumer(token)(klass);
};

export default outlet;
