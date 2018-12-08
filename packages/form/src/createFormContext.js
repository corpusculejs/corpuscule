import createContext from '@corpuscule/context';
import createFieldDecorator from './field';
import createFormDecorator from './form';

const createFormContext = () => {
  const {
    consumer,
    contextValue,
    provider,
    providingValue,
  } = createContext();

  const form = createFormDecorator({provider, providingValue});
  const field = createFieldDecorator({consumer, contextValue, providingValue});

  return {
    field,
    form,
    formApi: providingValue,
  };
};

export default createFormContext;
