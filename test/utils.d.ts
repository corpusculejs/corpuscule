import {Constructor} from '../packages/typings/lib';

export const genName: () => string;

export const createTestingPromise: () => [Promise<void>, () => void];

export const createSimpleContext: <P extends Element, C extends Element>(
  Provider: Constructor<P>,
  Consumer: Constructor<C>,
) => Promise<[P, C]>;

export const waitForMutationObserverChange: (
  elementToObserve: HTMLElement,
  options: MutationObserverInit,
) => Promise<void>;
