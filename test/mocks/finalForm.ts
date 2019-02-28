// @ts-ignore
export {
  configOptions,
  fieldSubscriptionItems,
  formSubscriptionItems,
} from 'final-form/dist/final-form.es'; // tslint:disable-line:no-implicit-dependencies

export const unsubscribe = jasmine.createSpy('unsubscribe');

export const formSpyObject = jasmine.createSpyObj('finalForm', [
  'get',
  'initialize',
  'registerField',
  'setConfig',
  'submit',
  'subscribe',
]);

formSpyObject.subscribe.and.returnValue(unsubscribe);
formSpyObject.registerField.and.returnValue(unsubscribe);

export const createForm = jasmine.createSpy('createForm');
createForm.and.returnValue(formSpyObject);
