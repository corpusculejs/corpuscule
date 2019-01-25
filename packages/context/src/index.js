import createProvider from './provider';
import createValue from './value';
import createConsumer from './consumer';
import {lifecycleKeys} from '@corpuscule/utils/lib/descriptors';

const randomString = () => {
  const arr = new Uint32Array(2);
  const [rnd1, rnd2] = crypto.getRandomValues(arr);

  return `${rnd1}${rnd2}`;
};

const createContext = defaultValue => {
  const shared = {
    consumers: new WeakMap(),
    eventName: randomString(),
    providers: new WeakSet(),
    value: new WeakMap(),
  };

  return {
    consumer: createConsumer(shared, lifecycleKeys),
    provider: createProvider(shared, lifecycleKeys),
    value: createValue(shared, defaultValue),
  };
};

export default createContext;
