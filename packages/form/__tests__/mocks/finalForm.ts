// @ts-ignore
import {configOptions, formSubscriptionItems} from 'final-form/dist/final-form.es';

export {
  configOptions,
  formSubscriptionItems,
};

export const formSpyObject = jasmine.createSpyObj('finalForm', [
  'get',
  'initialize',
  'setConfig',
  'submit',
  'subscribe',
]);
export const createForm = jasmine.createSpy('createForm');
createForm.and.returnValue(formSpyObject);
