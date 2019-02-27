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
    formApi: new WeakMap(),
    input: new WeakMap(),
    meta: new WeakMap(),
    state: new WeakMap(),
  };

  const optionShared = fieldOptions.reduce((map, option) => {
    map[option] = new WeakMap();

    return map;
  }, {});

  const propsShared = {
    // @form properties
    compare: new WeakMap(),
    configInitializers: new WeakMap(),

    // @field properties
    ref: new WeakMap(),
    scheduler,
    subscribe: new WeakMap(),
    update: new WeakMap(),
  };

  const api = createApiDecorator(context, apiShared, propsShared);
  const field = createFieldDecorator(context, apiShared, optionShared, propsShared);
  const form = createFormDecorator(context, apiShared, propsShared);
  const option = createOptionDecorator(apiShared, optionShared, propsShared);

  return {
    api,
    field,
    form,
    isForm: context.isProvider,
    option,
  };
};

export const {api, field, form, isForm, option} = createFormContext();
