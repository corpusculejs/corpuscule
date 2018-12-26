import {formSubscriptionItems} from 'final-form';

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
