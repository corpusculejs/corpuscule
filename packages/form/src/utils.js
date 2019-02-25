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
  const isFormValueArray = Array.isArray(formValue);

  switch (type) {
    case 'checkbox': {
      // Form maintains an array, not just a boolean
      if (defaultValue) {
        // Add value to formValue array
        if (checked) {
          return isFormValueArray ? [...formValue, value] : [value];
        }

        // Remove value from formValue array
        if (!isFormValueArray) {
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
      // Element input[type=radio] is also here
      return value;
  }
};

const setSingleValue = (target, formValue) => {
  switch (target.type) {
    case 'checkbox':
      target.checked = Array.isArray(formValue) ? formValue.includes(target.value) : !!formValue;
      break;
    case 'radio':
      target.checked = formValue === target.value;
      break;
    case 'select-multiple':
      for (const option of target.options) {
        option.selected = Array.isArray(formValue) && formValue.includes(option.value);
      }
      break;
    default:
      target.value = formValue;
  }
};

export const setTargetValues = (targets, formValue) => {
  if (targets instanceof NodeList) {
    for (const target of targets) {
      setSingleValue(target, formValue);
    }
  } else {
    setSingleValue(targets, formValue);
  }
};

export const filter = elements =>
  elements.filter(
    ({key, placement}) => !(lifecycleKeys.includes(key) && placement === 'prototype'),
  );
