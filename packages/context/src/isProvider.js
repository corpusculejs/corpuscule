import {registry} from './utils';

const isProvider = (token, target) => {
  const [, providers] = registry.get(token);

  return providers.has(target);
};

export default isProvider;
