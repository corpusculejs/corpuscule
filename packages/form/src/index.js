import {isProvider} from '@corpuscule/context';
import gearAdvanced from './gear';
import fieldAdvanced from './field';
import formAdvanced from './form';
import optionAdvanced from './option';
import {createFormToken} from './utils';

export {
  gearAdvanced,
  createFormToken,
  fieldAdvanced,
  formAdvanced,
  isProvider as isFormAdvanced,
  optionAdvanced,
};

const defaultToken = createFormToken();

export const gear = responsibilityKey =>
  gearAdvanced(defaultToken, responsibilityKey);
export const field = options => fieldAdvanced(defaultToken, options);
export const form = options => formAdvanced(defaultToken, options);
export const isForm = klass => isProvider(defaultToken, klass);
export const option = responsibilityKey =>
  optionAdvanced(defaultToken, responsibilityKey);
