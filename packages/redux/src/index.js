import createContext from '@corpuscule/context';
import {createDispatcherDecorator} from './dispatcher';
import {createReduxDecorator} from './redux';
import {createUnitDecorator} from './unit';

export const createReduxContext = () => {
  const context = createContext();

  const shared = {
    store: new WeakMap(),
    units: new WeakMap(),
  };

  return {
    api: context.value,
    dispatcher: createDispatcherDecorator(shared),
    isProvider: context.isProvider,
    provider: context.provider,
    redux: createReduxDecorator(context, shared),
    unit: createUnitDecorator(shared),
  };
};

export const {api, dispatcher, isProvider, provider, redux, unit} = createReduxContext();
