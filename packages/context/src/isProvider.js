import {tokenRegistry} from './utils';

const isProvider = (token, klass) => {
  const [, , providers] = tokenRegistry.get(token);

  return providers.has(klass);
};

export default isProvider;
