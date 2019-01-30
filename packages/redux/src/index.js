import createContext from '@corpuscule/context';
import {createDispatcherDecorator} from './dispatcher';
import {createReduxDecorator} from './redux';
import {createUnitDecorator} from './unit';

export const createReduxContext = () => {
  const context = createContext();

  const dispathcerShared = {
    store: new WeakMap(),
  };

  const unitShared = {
    units: new WeakMap(),
  };

  return {
    api: context.value,
    dispatcher: createDispatcherDecorator(dispathcerShared),
    isProvider: context.isProvider,
    provider: context.provider,
    redux: createReduxDecorator(context, unitShared, dispathcerShared),
    unit: createUnitDecorator(unitShared),
  };
};

export const {api, dispatcher, isProvider, provider, redux, unit} = createReduxContext();
