// tslint:disable:no-unbound-method
import {FieldState, FieldValidator, FormApi} from 'final-form';
import {createMockedContextElements} from '../../../test/mocks/context';
import {formSpyObject} from '../../../test/mocks/finalForm';
import {HTMLElementMock} from '../../../test/utils';
import {Field, field, FieldConfigKey, FieldInputProps, FieldMetaProps, fieldOption, form, formApi, input, meta} from '../src';
import {all} from '../src/utils';

const testField = () => {
  fdescribe('@field', () => {
    let scheduler: jasmine.Spy;
    let state: jasmine.SpyObj<FieldState>;
    let fieldValue: object;
    let metaObject: FieldMetaProps;

    const subscribeField = <T>(fieldElement: T): [(state: FieldState) => void, FieldValidator] => {
      const [subscribe] = scheduler.calls.mostRecent().args;
      subscribe.call(fieldElement);

      const [, listener, , {getValidator}] = formSpyObject.registerField.calls.mostRecent().args;

      return [listener, getValidator()];
    };

    const updateField = <T>(fieldElement: T, listener: (state: FieldState) => void) => {
      listener(state);

      const [update] = scheduler.calls.mostRecent().args;
      update.call(fieldElement);
    };

    beforeEach(() => {
      formSpyObject.registerField.calls.reset();
      scheduler = jasmine.createSpy('scheduler');
      fieldValue = {};
      state = jasmine.createSpyObj('formState', [
        'blur',
        'change',
        'focus',
      ]);

      metaObject = {
        active: false,
        data: {},
        dirty: false,
        dirtySinceLastSubmit: false,
        error: 'Error',
        initial: {},
        invalid: false,
        pristine: false,
        submitError: 'SubmitError',
        submitFailed: false,
        submitSucceeded: false,
        touched: false,
        valid: false,
        visited: false,
      };

      Object.assign(state, metaObject, {name: 'test', value: fieldValue});
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

    it('subscribes to form with defined options', () => {
      @form()
      class Form extends HTMLElementMock {
      }

      @field({scheduler})
      class FormField extends HTMLElementMock implements Field<string> {
        public readonly [formApi]: FormApi;
        public readonly [input]: FieldInputProps<string>;
        public readonly [meta]: FieldMetaProps;

        @fieldOption('name')
        public name: string = 'test';

        @fieldOption('isEqual')
        public isEqual(): boolean {
          return true;
        }

        @fieldOption('validate')
        public validate(): boolean {
          return true;
        }

        @fieldOption('validateFields')
        public validateFields(): boolean {
          return true;
        }
      }

      const [, fieldElement] = createMockedContextElements(Form, FormField);
      const [listener, validate] = subscribeField(fieldElement);

      expect(formSpyObject.registerField).toHaveBeenCalledWith(
        'test',
        listener,
        all,
        {
          getValidator: jasmine.any(Function),
          isEqual: fieldElement.isEqual,
          validateFields: fieldElement.validateFields,
        },
      );

      expect(validate).toBe(fieldElement.validate);
    });

    it('creates new input and meta objects on each form update', () => {
      @form()
      class Form extends HTMLElementMock {
      }

      @field({scheduler})
      class FormField extends HTMLElementMock implements Field<object> {
        public readonly [formApi]: FormApi;
        public readonly [input]: FieldInputProps<object>;
        public readonly [meta]: FieldMetaProps;
      }

      const [, fieldElement] = createMockedContextElements(Form, FormField);
      const [listener] = subscribeField(fieldElement);
      updateField(fieldElement, listener);

      expect(scheduler).toHaveBeenCalledTimes(2);
      expect(fieldElement[input]).toEqual({
        name: 'test',
        onBlur: jasmine.any(Function),
        onChange: jasmine.any(Function),
        onFocus: jasmine.any(Function),
        value: fieldValue,
      });

      expect(fieldElement[meta]).toEqual(metaObject);
    });

    it('formats value for [input] if format option is set and formatOnBlur is disabled', () => {
      @form()
      class Form extends HTMLElementMock {
      }

      @field({scheduler})
      class FormField extends HTMLElementMock implements Field<object> {
        public readonly [formApi]: FormApi;
        public readonly [input]: FieldInputProps<object>;
        public readonly [meta]: FieldMetaProps;

        @fieldOption('formatOnBlur')
        public formatOnBlur: boolean = false;

        @fieldOption('format')
        public format(value: unknown): unknown {
          return value;
        }
      }

      const [, fieldElement] = createMockedContextElements(Form, FormField);

      spyOn(fieldElement, 'format').and.callThrough();

      const [listener] = subscribeField(fieldElement);
      updateField(fieldElement, listener);

      expect(fieldElement.format).toHaveBeenCalledWith(fieldValue, 'test');
    });

    it('avoids unnecessary scheduling if update called many times', () => {
      @form()
      class Form extends HTMLElementMock {
      }

      @field({scheduler})
      class FormField extends HTMLElementMock implements Field<object> {
        public readonly [formApi]: FormApi;
        public readonly [input]: FieldInputProps<object>;
        public readonly [meta]: FieldMetaProps;
      }

      const [, fieldElement] = createMockedContextElements(Form, FormField);
      const [listener] = subscribeField(fieldElement);

      scheduler.calls.reset();

      listener(state);
      listener(state);

      expect(scheduler).toHaveBeenCalledTimes(1);
    });

    it('avoids unnecessary scheduling if subscribe called many times', () => {
      @form()
      class Form extends HTMLElementMock {
      }

      @field({scheduler})
      class FormField extends HTMLElementMock implements Field<object> {
        public readonly [formApi]: FormApi;
        public readonly [input]: FieldInputProps<object>;
        public readonly [meta]: FieldMetaProps;
      }

      const [, fieldElement] = createMockedContextElements(Form, FormField);
      fieldElement.connectedCallback();
      fieldElement.connectedCallback();

      expect(scheduler).toHaveBeenCalledTimes(1);
    });

    const testResubscription = <T>(type: FieldConfigKey, oldValue: T, newValue: T) => {
      it(`resubscribes on field ${type} change`, () => {
        @form()
        class Form extends HTMLElementMock {
        }

        @field({scheduler})
        class FormField extends HTMLElementMock implements Field<object> {
          public readonly [formApi]: FormApi;
          public readonly [input]: FieldInputProps<object>;
          public readonly [meta]: FieldMetaProps;

          @fieldOption(type)
          // @ts-ignore
          public [type]: T = oldValue;
        }

        const [, fieldElement] = createMockedContextElements(Form, FormField);
        subscribeField(fieldElement);

        // @ts-ignore
        fieldElement[type] = newValue;

        expect(scheduler).toHaveBeenCalledTimes(2);
      });

      it(`does not resubscribe on field ${type} change if values are equal`, () => {
        @form()
        class Form extends HTMLElementMock {
        }

        @field({scheduler})
        class FormField extends HTMLElementMock implements Field<object> {
          public readonly [formApi]: FormApi;
          public readonly [input]: FieldInputProps<object>;
          public readonly [meta]: FieldMetaProps;

          @fieldOption(type)
          // @ts-ignore
          public [type]: T = oldValue;
        }

        const [, fieldElement] = createMockedContextElements(Form, FormField);
        subscribeField(fieldElement);

        // @ts-ignore
        fieldElement[type] = oldValue;

        expect(scheduler).toHaveBeenCalledTimes(1);
      });
    };

    testResubscription('name', 'test1', 'test2');
    testResubscription('subscription', all, {active: true});

    describe('[input]', () => {
      it('calls blur() method of field state if [input].onBlur() is called', () => {
        @form()
        class Form extends HTMLElementMock {
        }

        @field({scheduler})
        class FormField extends HTMLElementMock implements Field<object> {
          public readonly [formApi]: FormApi;
          public readonly [input]: FieldInputProps<object>;
          public readonly [meta]: FieldMetaProps;
        }

        const [, fieldElement] = createMockedContextElements(Form, FormField);
        const [listener] = subscribeField(fieldElement);
        updateField(fieldElement, listener);

        fieldElement[input].onBlur();

        expect(state.blur).toHaveBeenCalled();
      });

      it('formats and sets value on blur if appropriate options are set', () => {
        @form()
        class Form extends HTMLElementMock {
        }

        @field({scheduler})
        class FormField extends HTMLElementMock implements Field<object> {
          public readonly [formApi]: FormApi;
          public readonly [input]: FieldInputProps<object>;
          public readonly [meta]: FieldMetaProps;

          @fieldOption('formatOnBlur')
          public formatOnBlur: boolean = true;

          @fieldOption('format')
          public format(value: unknown): unknown {
            return value;
          }
        }

        const [, fieldElement] = createMockedContextElements(Form, FormField);

        spyOn(fieldElement, 'format').and.callThrough();

        const [listener] = subscribeField(fieldElement);
        updateField(fieldElement, listener);

        fieldElement[input].onBlur();

        expect(fieldElement.format).toHaveBeenCalledWith(fieldValue, 'test');
        expect(state.change).toHaveBeenCalledWith(fieldValue);
      });

      it('calls change() method of field state [input].onChange() is called', () => {
        @form()
        class Form extends HTMLElementMock {
        }

        @field({scheduler})
        class FormField extends HTMLElementMock implements Field<object> {
          public readonly [formApi]: FormApi;
          public readonly [input]: FieldInputProps<object>;
          public readonly [meta]: FieldMetaProps;
        }

        const [, fieldElement] = createMockedContextElements(Form, FormField);
        const [listener] = subscribeField(fieldElement);
        updateField(fieldElement, listener);

        const newFieldValue = {};

        fieldElement[input].onChange(newFieldValue);

        expect(state.change).toHaveBeenCalledWith(newFieldValue);
      });

      it('parses value if parse option is defined', () => {
        @form()
        class Form extends HTMLElementMock {
        }

        @field({scheduler})
        class FormField extends HTMLElementMock implements Field<string> {
          public readonly [formApi]: FormApi;
          public readonly [input]: FieldInputProps<string>;
          public readonly [meta]: FieldMetaProps;

          @fieldOption('parse')
          public parse(value: string): object {
            return JSON.parse(value);
          }
        }

        const [, fieldElement] = createMockedContextElements(Form, FormField);
        const [listener] = subscribeField(fieldElement);
        updateField(fieldElement, listener);

        spyOn(fieldElement, 'parse').and.callThrough();

        const newFieldValue = JSON.stringify({});

        fieldElement[input].onChange(newFieldValue);

        expect(fieldElement.parse).toHaveBeenCalledWith(newFieldValue, 'test');
        expect(state.change).toHaveBeenCalledWith({});
      });

      it('calls focus() method of field stat if [input].onFocus() method is called', () => {
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
        const [listener] = subscribeField(fieldElement);
        updateField(fieldElement, listener);

        fieldElement[input].onFocus();

        expect(state.focus).toHaveBeenCalled();
      });
    });
  });
};

export default testField;
