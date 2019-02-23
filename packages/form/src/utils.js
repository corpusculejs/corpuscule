import {lifecycleKeys} from '@corpuscule/utils/lib/descriptors';
import {configOptions, formSubscriptionItems} from 'final-form';

export const noop = () => {}; // eslint-disable-line no-empty-function

export const formOptions = [...configOptions, 'compareInitialValues'];

export const apis = ['formApi', 'input', 'meta', 'state'];

export const fieldOptions = [
  'format',
  'formatOnBlur',
  'isEqual',
  'name',
  'parse',
  'subscription',
  'validate',
  'validateFields',
  'value',
];

export const all = formSubscriptionItems.reduce((result, key) => {
  result[key] = true;

  return result;
}, {});

export const getTargetValue = (
  {checked, defaultValue, selectedOptions, type, value},
  formValue,
) => {
  switch (type) {
    case 'checkbox': {
      // Form maintains an array, not just a boolean
      if (defaultValue) {
        // Add value to formValue array
        if (checked) {
          return Array.isArray(formValue) ? formValue.concat(value) : [value];
        }

        // Remove value from formValue array
        if (!Array.isArray(formValue)) {
          return formValue;
        }

        return formValue.filter(v => v !== value);
      }

      // It's just a boolean
      return !!checked;
    }
    case 'select-one':
      return selectedOptions[0].value;
    case 'select-multiple':
      return Array.from(selectedOptions, option => option.value);
    default:
      return value;
  }
};

export const setTargetValues = (targets, formValue) => {
  const isFormValueArray = Array.isArray(formValue);

  for (const target of targets) {
    switch (target.type) {
      case 'checkbox':
        if (target.value === undefined) {
          target.checked = !!formValue;
        } else {
          target.checked = isFormValueArray && formValue.includes(target.value);
        }
        break;
      case 'radio':
        target.checked = formValue === target.value;
        break;
      case 'select':
        target.value = formValue;
        break;
      case 'select-multiple':
        for (let i = 0; i < target.options; i++) {
          target.options[i].selected =
            isFormValueArray && formValue.includes(target.options[i].value);
        }
        break;
      default:
        break;
    }
  }
};

export const filter = elements =>
  elements.filter(
    ({key, placement}) => !(lifecycleKeys.includes(key) && placement === 'prototype'),
  );
