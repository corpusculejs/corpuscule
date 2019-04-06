import {tokenRegistry} from './utils';

const isProvider = (token, target) => {
  const [, , providers] = tokenRegistry.get(token);

  return providers.has(target);
};

export default isProvider;
