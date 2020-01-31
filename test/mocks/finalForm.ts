export {
  configOptions,
  fieldSubscriptionItems,
  formSubscriptionItems,
} from 'final-form';

export const unsubscribe = jasmine.createSpy('unsubscribe');

export const formSpyObject = jasmine.createSpyObj('finalForm', [
  'get',
  'initialize',
  'registerField',
  'reset',
  'setConfig',
  'submit',
  'subscribe',
]);

formSpyObject.subscribe.and.returnValue(unsubscribe);
formSpyObject.registerField.and.returnValue(unsubscribe);

export const createForm = jasmine.createSpy('createForm');
createForm.and.returnValue(formSpyObject);
