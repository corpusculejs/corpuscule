import {FormApi} from 'final-form';
import {createMockedContextElements} from '../../../test/mocks/context';
import {formSpyObject} from '../../../test/mocks/finalForm';
import {HTMLElementMock} from '../../../test/utils';
import {Field, field, FieldInputProps, FieldMetaProps, form, formApi, input, meta} from '../src';

const testField = () => {
  describe('@field', () => {
    let scheduler: jasmine.Spy;

    beforeEach(() => {
      formSpyObject.registerField.calls.reset();
      scheduler = jasmine.createSpy('scheduler');
    });

    it('creates field that receives form', () => {
      @form()
      class Form extends HTMLElementMock {
      }

      @field({scheduler})
      class FormField extends HTMLElementMock implements Field<string> {
        public readonly [formApi]: FormApi;
        public readonly [input]: FieldInputProps<string>;
        public readonly [meta]: FieldMetaProps;
      }

      const [, fieldElement] = createMockedContextElements(Form, FormField);

      expect(fieldElement[formApi]).toBe(formSpyObject);
      expect(formSpyObject.subscribe).toHaveBeenCalled();
      expect(scheduler).toHaveBeenCalledWith(jasmine.any(Function));
    });
  });
};

export default testField;
