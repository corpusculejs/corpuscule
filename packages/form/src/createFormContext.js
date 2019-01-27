import createContext from '@corpuscule/context';
import defaultScheduler from '@corpuscule/utils/lib/scheduler';
import createApiDecorator from './api';
import createFieldDecorator from './field';
import createFormDecorator from './form';
import createOptionDecorator from './option';
import {fieldOptions} from './utils';

const createFormContext = ({scheduler = defaultScheduler} = {}) => {
  const context = createContext();

  const commonShared = {
    api: new WeakMap(),
  };

  const fieldShared = {
    input: new WeakMap(),
    meta: new WeakMap(),
    options: fieldOptions.reduce((map, option) => {
      map[option] = new WeakMap();

      return map;
    }, {}),
    scheduler,
    subscribe: new WeakMap(),
    update: new WeakMap(),
  };

  const formShared = {
    compare: new WeakMap(),
    configInitializers: new WeakMap(),
    state: new WeakMap(),
  };

  const api = createApiDecorator(context, commonShared, fieldShared, formShared);
  const field = createFieldDecorator(context, commonShared, fieldShared);
  const form = createFormDecorator(context, commonShared, formShared);
  const option = createOptionDecorator(commonShared, fieldShared, formShared);

  return {
    api,
    field,
    form,
    option,
  };
};

export const {field, form, formApi} = createFormContext();

export default createFormContext;
