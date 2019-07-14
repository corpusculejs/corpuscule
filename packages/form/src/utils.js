import {createContextToken} from '@corpuscule/context';
import createTokenRegistry from '@corpuscule/utils/lib/tokenRegistry';
import {configOptions} from 'final-form';

export const [createFormToken, tokenRegistry] = createTokenRegistry(
  () => new WeakMap(), // Shared properties list
  createContextToken,
);

export const noop = () => {}; // eslint-disable-line no-empty-function

export const formOptionResponsibilityKeys = [...configOptions, 'compareInitialValues'];

export const gearResponsibilityKeys = ['formApi', 'input', 'meta', 'refs', 'state'];

export const fieldOptionResponsibilityKeys = [
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

export const isNativeElement = element =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLSelectElement ||
  element instanceof HTMLTextAreaElement;

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
      target.value =
        isNativeElement && (formValue === null || formValue === undefined) ? '' : formValue;
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
