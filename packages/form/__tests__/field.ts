// tslint:disable:no-unbound-method
import {FieldState, FieldValidator, FormApi} from 'final-form';
import {createMockedContextElements} from '../../../test/mocks/context';
import {formSpyObject, unsubscribe} from '../../../test/mocks/finalForm';
import {CustomElement} from '../../../test/utils';
import {
  createFormContext,
  Field,
  FieldConfigKey,
  FieldDecorator,
  FieldInputProps,
  FieldMetaProps,
  fieldOption,
  FormDecorator,
  input,
  meta,
} from '../src';
import {all} from '../src/utils';

const testField = () => {
  describe('@field', () => {
    let scheduler: jasmine.Spy;
    let state: jasmine.SpyObj<FieldState>;
    let fieldValue: object;
    let metaObject: FieldMetaProps;

    let form: FormDecorator;
    let field: FieldDecorator;
    let formApi: 'formApi';

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
      ({field, form, formApi} = createFormContext());

      unsubscribe.calls.reset();
      formSpyObject.registerField.calls.reset();
      scheduler = jasmine.createSpy('scheduler');
      fieldValue = {};
      state = jasmine.createSpyObj('formState', ['blur', 'change', 'focus']);

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
      class Form extends CustomElement {}

      @field({scheduler})
      class FormField extends CustomElement implements Field<string> {
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
      class Form extends CustomElement {}

      @field({scheduler})
      class FormField extends CustomElement implements Field<string> {
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

      expect(formSpyObject.registerField).toHaveBeenCalledWith('test', listener, all, {
        getValidator: jasmine.any(Function),
        isEqual: fieldElement.isEqual,
        validateFields: fieldElement.validateFields,
      });

      expect(validate).toBe(fieldElement.validate);
    });

    it('creates new input and meta objects on each form update', () => {
      @form()
      class Form extends CustomElement {}

      @field({scheduler})
      class FormField extends CustomElement implements Field<object> {
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
        value: fieldValue,
      });

      expect(fieldElement[meta]).toEqual(metaObject);
    });

    it('formats value for [input] if format option is set and formatOnBlur is disabled', () => {
      @form()
      class Form extends CustomElement {}

      @field({scheduler})
      class FormField extends CustomElement implements Field<object> {
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
      class Form extends CustomElement {}

      @field({scheduler})
      class FormField extends CustomElement implements Field<object> {
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
      class Form extends CustomElement {}

      @field({scheduler})
      class FormField extends CustomElement implements Field<object> {
        public readonly [formApi]: FormApi;
        public readonly [input]: FieldInputProps<object>;
        public readonly [meta]: FieldMetaProps;
      }

      const [, fieldElement] = createMockedContextElements(Form, FormField);
      fieldElement.connectedCallback();
      fieldElement.connectedCallback();

      expect(scheduler).toHaveBeenCalledTimes(1);
    });

    it('unsubscribes on disconnectedCallback', () => {
      @form()
      class Form extends CustomElement {}

      @field({scheduler})
      class FormField extends CustomElement implements Field<object> {
        public readonly [formApi]: FormApi;
        public readonly [input]: FieldInputProps<object>;
        public readonly [meta]: FieldMetaProps;
      }

      const [, fieldElement] = createMockedContextElements(Form, FormField);
      subscribeField(fieldElement);

      fieldElement.disconnectedCallback();

      expect(unsubscribe).toHaveBeenCalled();
    });

    it('unsubscribes on new subscription', () => {
      @form()
      class Form extends CustomElement {}

      @field({scheduler})
      class FormField extends CustomElement implements Field<object> {
        public readonly [formApi]: FormApi;
        public readonly [input]: FieldInputProps<object>;
        public readonly [meta]: FieldMetaProps;
      }

      const [, fieldElement] = createMockedContextElements(Form, FormField);
      subscribeField(fieldElement);
      subscribeField(fieldElement);

      expect(unsubscribe).toHaveBeenCalled();
    });

    describe('@fieldOption', () => {
      const testResubscription = <T>(type: FieldConfigKey, oldValue: T, newValue: T) => {
        it(`resubscribes on option ${type} value change`, () => {
          @form()
          class Form extends CustomElement {}

          @field({scheduler})
          class FormField extends CustomElement implements Field<object> {
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

        it(`does not resubscribe on field ${type} change if option values are equal`, () => {
          @form()
          class Form extends CustomElement {}

          @field({scheduler})
          class FormField extends CustomElement implements Field<object> {
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

      it('updates field if option value is changed', () => {
        @form()
        class Form extends CustomElement {}

        @field({scheduler})
        class FormField extends CustomElement implements Field<object> {
          public readonly [formApi]: FormApi;
          public readonly [input]: FieldInputProps<object>;
          public readonly [meta]: FieldMetaProps;

          @fieldOption('value')
          public value: string = 'test';
        }

        const [, fieldElement] = createMockedContextElements(Form, FormField);
        subscribeField(fieldElement);

        scheduler.calls.reset();

        fieldElement.value = 'newTest';

        expect(scheduler).toHaveBeenCalled();
      });

      it('does not update field if it option values are equal', () => {
        @form()
        class Form extends CustomElement {}

        @field({scheduler})
        class FormField extends CustomElement implements Field<object> {
          public readonly [formApi]: FormApi;
          public readonly [input]: FieldInputProps<object>;
          public readonly [meta]: FieldMetaProps;

          @fieldOption('value')
          public value: string = 'test';
        }

        const [, fieldElement] = createMockedContextElements(Form, FormField);
        subscribeField(fieldElement);

        scheduler.calls.reset();

        fieldElement.value = 'test';

        expect(scheduler).not.toHaveBeenCalled();
      });

      it('throws an error if option name is not one of Field config keys', () => {
        expect(() => {
          @field({scheduler})
          // @ts-ignore
          class FormField extends CustomElement implements Field<object> {
            public readonly [formApi]: FormApi;
            public readonly [input]: FieldInputProps<object>;
            public readonly [meta]: FieldMetaProps;

            @fieldOption('test' as any)
            public value: string = 'test';
          }
        }).toThrow(new TypeError('"test" is not one of the Final Form Field configuration keys'));
      });
    });

    describe('[input]', () => {
      it('calls blur() method of field state if [input].onBlur() is called', () => {
        @form()
        class Form extends CustomElement {}

        @field({scheduler})
        class FormField extends CustomElement implements Field<object> {
          public readonly [formApi]: FormApi;
          public readonly [input]: FieldInputProps<object>;
          public readonly [meta]: FieldMetaProps;
        }

        const [, fieldElement] = createMockedContextElements(Form, FormField);
        const [listener] = subscribeField(fieldElement);
        updateField(fieldElement, listener);

        fieldElement.dispatchEvent(new Event('blur'));

        expect(state.blur).toHaveBeenCalled();
      });

      it('formats and sets value on blur if appropriate options are set', () => {
        @form()
        class Form extends CustomElement {}

        @field({scheduler})
        class FormField extends CustomElement implements Field<object> {
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

        fieldElement.dispatchEvent(new Event('blur'));

        expect(fieldElement.format).toHaveBeenCalledWith(fieldValue, 'test');
        expect(state.change).toHaveBeenCalledWith(fieldValue);
      });

      it('calls change() method of field state when new "change" event is fired', () => {
        @form()
        class Form extends CustomElement {}

        @field({scheduler})
        class FormField extends CustomElement implements Field<object> {
          public readonly [formApi]: FormApi;
          public readonly [input]: FieldInputProps<object>;
          public readonly [meta]: FieldMetaProps;
        }

        const [, fieldElement] = createMockedContextElements(Form, FormField);
        const [listener] = subscribeField(fieldElement);
        updateField(fieldElement, listener);

        const newFieldValue: object = {};

        fieldElement.dispatchEvent(new CustomEvent('change', {detail: newFieldValue}));

        expect(state.change).toHaveBeenCalledWith(newFieldValue);
      });

      it('parses value if parse option is defined', () => {
        @form()
        class Form extends CustomElement {}

        @field({scheduler})
        class FormField extends CustomElement implements Field<string> {
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

        fieldElement.dispatchEvent(new CustomEvent('change', {detail: newFieldValue}));

        expect(fieldElement.parse).toHaveBeenCalledWith(newFieldValue, 'test');
        expect(state.change).toHaveBeenCalledWith({});
      });

      it('calls focus() method of field stat if [input].onFocus() method is called', () => {
        @form()
        class Form extends CustomElement {}

        @field({scheduler})
        class FormField extends CustomElement implements Field<string> {
          public readonly [formApi]: FormApi;
          public readonly [input]: FieldInputProps<string>;
          public readonly [meta]: FieldMetaProps;
        }

        const [, fieldElement] = createMockedContextElements(Form, FormField);
        const [listener] = subscribeField(fieldElement);
        updateField(fieldElement, listener);

        fieldElement.dispatchEvent(new Event('focus'));

        expect(state.focus).toHaveBeenCalled();
      });
    });

    describe('default fields', () => {
      let fieldElement: HTMLElement;

      beforeEach(() => {
        @form()
        class Form extends CustomElement {}

        @field({scheduler})
        class FormField extends CustomElement implements Field<object> {
          public readonly [formApi]: FormApi;
          public readonly [input]: FieldInputProps<object>;
          public readonly [meta]: FieldMetaProps;
        }

        [, fieldElement] = createMockedContextElements(Form, FormField);
      });

      it('property updates form on input change event', () => {
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        fieldElement.appendChild(inputElement);

        const [listener] = subscribeField(fieldElement);
        updateField(fieldElement, listener);

        inputElement.value = 'test';
        inputElement.dispatchEvent(new Event('change', {bubbles: true}));

        expect(state.change).toHaveBeenCalledWith('test');
      });

      describe('checkbox', () => {
        it('sets boolean value if no value exists', () => {
          const inputElement = document.createElement('input');
          inputElement.type = 'checkbox';
          fieldElement.appendChild(inputElement);

          const [listener] = subscribeField(fieldElement);
          updateField(fieldElement, listener);

          inputElement.checked = true;
          inputElement.dispatchEvent(new Event('change', {bubbles: true}));

          expect(state.change).toHaveBeenCalledWith(true);
        });

        it('sets array value if value exists', () => {
          const inputElement = document.createElement('input');
          inputElement.type = 'checkbox';
          inputElement.value = 'foo';
          fieldElement.appendChild(inputElement);

          const [listener] = subscribeField(fieldElement);
          updateField(fieldElement, listener);

          inputElement.checked = true;
          inputElement.dispatchEvent(new Event('change', {bubbles: true}));

          expect(state.change).toHaveBeenCalledWith(['foo']);
        });

        it('updates array value if checked', () => {
          const inputElement = document.createElement('input');
          inputElement.type = 'checkbox';
          inputElement.value = 'foo';

          fieldElement.appendChild(inputElement);

          state.value = ['bar'];

          const [listener] = subscribeField(fieldElement);
          updateField(fieldElement, listener);

          inputElement.checked = true;
          inputElement.dispatchEvent(new Event('change', {bubbles: true}));

          expect(state.change).toHaveBeenCalledWith(['bar', 'foo']);
        });

        it('removes value if unchecked', () => {
          const inputElement = document.createElement('input');
          inputElement.type = 'checkbox';
          inputElement.value = 'foo';
          inputElement.checked = true;

          fieldElement.appendChild(inputElement);

          state.value = ['foo'];

          const [listener] = subscribeField(fieldElement);
          updateField(fieldElement, listener);

          inputElement.checked = false;
          inputElement.dispatchEvent(new Event('change', {bubbles: true}));

          expect(state.change).toHaveBeenCalledWith([]);
        });

        it('does nothing if form value is not an array', () => {
          const inputElement = document.createElement('input');
          inputElement.type = 'checkbox';
          inputElement.value = 'foo';

          fieldElement.appendChild(inputElement);

          state.value = undefined;

          const [listener] = subscribeField(fieldElement);
          updateField(fieldElement, listener);

          inputElement.checked = false;
          inputElement.dispatchEvent(new Event('change', {bubbles: true}));

          expect(state.change).toHaveBeenCalledWith(undefined);
        });
      });

      describe('select', () => {
        let selectElement: HTMLSelectElement;
        let option1: HTMLOptionElement;
        let option2: HTMLOptionElement;

        beforeEach(() => {
          selectElement = document.createElement('select');
          option1 = document.createElement('option');
          option1.value = '1';
          option1.textContent = 'one';

          option2 = document.createElement('option');
          option2.value = '2';
          option2.textContent = 'two';

          selectElement.appendChild(option1);
          selectElement.appendChild(option2);
        });

        it('sets the form value to the selected option if selection is single', () => {
          fieldElement.appendChild(selectElement);

          const [listener] = subscribeField(fieldElement);
          updateField(fieldElement, listener);

          option2.selected = true;
          selectElement.dispatchEvent(new Event('change', {bubbles: true}));

          expect(state.change).toHaveBeenCalledWith('2');
        });

        it('sets the form value to the array of selected option if selection is multiple', () => {
          selectElement.multiple = true;
          fieldElement.appendChild(selectElement);

          const [listener] = subscribeField(fieldElement);
          updateField(fieldElement, listener);

          option1.selected = true;
          option2.selected = true;

          selectElement.dispatchEvent(new Event('change', {bubbles: true}));

          expect(state.change).toHaveBeenCalledWith(['1', '2']);
        });
      });
    });
  });
};

export default testField;
