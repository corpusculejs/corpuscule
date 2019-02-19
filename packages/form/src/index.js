import createContext from '@corpuscule/context';
import defaultScheduler from '@corpuscule/utils/lib/scheduler';
import createApiDecorator from './api';
import createFieldDecorator from './field';
import createFormDecorator from './form';
import createOptionDecorator from './option';
import {fieldOptions} from './utils';

export const createFormContext = ({scheduler = defaultScheduler} = {}) => {
  const context = createContext();

  const apiShared = {
    form: new WeakMap(),
    input: new WeakMap(),
    meta: new WeakMap(),
    state: new WeakMap(),
  };

  const optionShared = fieldOptions.reduce((map, option) => {
    map[option] = new WeakMap();

    return map;
  }, {});

  const fieldShared = {
    scheduler,
    subscribe: new WeakMap(),
    update: new WeakMap(),
  };

  const formShared = {
    compare: new WeakMap(),
    configInitializers: new WeakMap(),
  };

  const api = createApiDecorator(context, apiShared);
  const field = createFieldDecorator(context, apiShared, optionShared, fieldShared);
  const form = createFormDecorator(context, apiShared, formShared);
  const option = createOptionDecorator(apiShared, optionShared, fieldShared, formShared);

  return {
    api,
    field,
    form,
    isForm: context.isProvider,
    option,
  };
};

export const {api, field, form, isForm, option} = createFormContext();
