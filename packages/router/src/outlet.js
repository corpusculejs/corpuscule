import {consumer, value} from '@corpuscule/context';
import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import {tokenRegistry} from './utils';

const outlet = (token, routes) => target => {
  let $value;

  const {prototype} = target;
  const $$contextProperty = Symbol();
  const valueDescriptor = value(token)(prototype, $$contextProperty);

  target.__registrations.push(() => {
    ({value: $value} = tokenRegistry.get(token).get(target));
    assertRequiredProperty('outlet', 'api', $value);
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

  consumer(token)(target);
};

export default outlet;
