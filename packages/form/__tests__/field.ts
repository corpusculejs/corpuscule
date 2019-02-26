// tslint:disable:no-unbound-method
import {defineCE, fixture} from '@open-wc/testing-helpers';
import {FieldState, FieldValidator, FormApi, FormState} from 'final-form';
import {formSpyObject, unsubscribe} from '../../../test/mocks/finalForm';
import {createSimpleContext, CustomElement, genName} from '../../../test/utils';
import {
  createFormContext,
  FieldDecorator,
  FieldInputProps,
  FieldMetaProps,
  FormDecorator,
} from '../src';
import {all} from '../src/utils';

const testField = () => {
  describe('@field', () => {
    let scheduler: jasmine.Spy;
    let isScheduledUpdate: boolean;
    let state: jasmine.SpyObj<FieldState>;
    let fieldValue: object;
    let metaObject: FieldMetaProps;
    let subscriptionInfo: {
      listeners: Array<(state: FieldState) => void>;
      subscribers: Array<() => void>;
      updaters: Array<() => void>;
      validators: FieldValidator[];
    };

    let api: PropertyDecorator;
    let form: FormDecorator;
    let field: FieldDecorator;
    let option: PropertyDecorator;

    const callListener = (listener: (state: FieldState) => void, s: FieldState) => {
      isScheduledUpdate = true;
      listener(s);
    };

    const SINGLE_FIELD_UPDATE = 2;

    beforeEach(() => {
      isScheduledUpdate = false;
      subscriptionInfo = {
        listeners: [],
        subscribers: [],
        updaters: [],
        validators: [],
      };
      scheduler = jasmine.createSpy('scheduler').and.callFake((fn: () => void) => {
        fn();

        if (!isScheduledUpdate) {
          isScheduledUpdate = true;

          const [
            ,
            listener,
            ,
            {getValidator},
          ] = formSpyObject.registerField.calls.mostRecent().args;

          subscriptionInfo.listeners.push(listener);
          subscriptionInfo.subscribers.push(fn);
          subscriptionInfo.validators.push(getValidator());

          callListener(listener, state);
        } else {
          isScheduledUpdate = false;
          subscriptionInfo.updaters.push(fn);
        }
      });

      ({api, field, form, option} = createFormContext({scheduler}));

      unsubscribe.calls.reset();
      formSpyObject.registerField.calls.reset();
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

    it('creates field that receives form', async () => {
      @form()
      class Form extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly input!: FieldInputProps<string>;
        @api public readonly meta!: FieldMetaProps;

        @option public readonly name: string = 'test';
      }

      const [, fieldElement] = await createSimpleContext(Form, Field);

      expect(fieldElement.formApi).toBe(formSpyObject);
      expect(formSpyObject.subscribe).toHaveBeenCalled();
      expect(scheduler).toHaveBeenCalledWith(jasmine.any(Function));
    });

    it('receives form before user-defined connectedCallback is run', async () => {
      const connectedCallbackSpy = jasmine.createSpy('connectedCallback');

      @form()
      class Form extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly input!: FieldInputProps<string>;
        @api public readonly meta!: FieldMetaProps;

        @option public readonly name: string = 'test';

        public connectedCallback(): void {
          connectedCallbackSpy(this.formApi);
        }
      }

      await createSimpleContext(Form, Field);

      expect(connectedCallbackSpy).toHaveBeenCalledWith(formSpyObject);
    });

    it('subscribes to form with defined options', async () => {
      @form()
      class Form extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly input!: FieldInputProps<string>;
        @api public readonly meta!: FieldMetaProps;

        @option public readonly name: string = 'test';

        @option
        public isEqual(): boolean {
          return true;
        }

        @option
        public validate(): boolean {
          return true;
        }

        @option
        public validateFields(): boolean {
          return true;
        }
      }

      const [, fieldElement] = await createSimpleContext(Form, Field);
      const [listener] = subscriptionInfo.listeners;
      const [validate] = subscriptionInfo.validators;

      expect(formSpyObject.registerField).toHaveBeenCalledWith('test', listener, all, {
        getValidator: jasmine.any(Function),
        isEqual: fieldElement.isEqual,
        validateFields: fieldElement.validateFields,
      });

      expect(validate).toBe(fieldElement.validate);
    });

    it('creates new input and meta objects on each form update', async () => {
      @form()
      class Form extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly input!: FieldInputProps<object>;
        @api public readonly meta!: FieldMetaProps;

        @option public readonly name: string = 'test';
      }

      const [, fieldElement] = await createSimpleContext(Form, Field);

      expect(scheduler).toHaveBeenCalledTimes(2);
      expect(fieldElement.input).toEqual({
        name: 'test',
        value: fieldValue,
      });

      expect(fieldElement.meta).toEqual(metaObject);
    });

    it('formats value for input if format option is set and formatOnBlur is disabled', async () => {
      const formatSpy = jasmine.createSpy('Field.format');

      @form()
      class Form extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly input!: FieldInputProps<object>;
        @api public readonly meta!: FieldMetaProps;

        @option public readonly name: string = 'test';

        @option
        public formatOnBlur: boolean = false;

        @option
        public format(value: unknown, name: string): unknown {
          formatSpy(value, name);

          return value;
        }
      }

      await createSimpleContext(Form, Field);

      expect(formatSpy).toHaveBeenCalledWith(fieldValue, 'test');
    });

    it('avoids unnecessary scheduling if update called many times', async () => {
      @form()
      class Form extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly input!: FieldInputProps<object>;
        @api public readonly meta!: FieldMetaProps;

        @option public readonly name: string = 'test';
      }

      await createSimpleContext(Form, Field);
      const [listener] = subscriptionInfo.listeners;

      scheduler.calls.reset();

      callListener(listener, state);
      callListener(listener, state);

      expect(scheduler).toHaveBeenCalledTimes(SINGLE_FIELD_UPDATE);
    });

    it('avoids unnecessary scheduling if subscribe called many times', async () => {
      scheduler.and.stub();

      @form()
      class Form extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly input!: FieldInputProps<object>;
        @api public readonly meta!: FieldMetaProps;

        @option public readonly name: string = 'test';
      }

      const [, fieldElement] = await createSimpleContext(Form, Field);
      fieldElement.connectedCallback();
      fieldElement.connectedCallback();

      // Number of scheduler calls without calling $$update
      expect(scheduler).toHaveBeenCalledTimes(1);
    });

    it('unsubscribes on disconnectedCallback', async () => {
      @form()
      class Form extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly input!: FieldInputProps<object>;
        @api public readonly meta!: FieldMetaProps;

        @option public readonly name: string = 'test';
      }

      const [, fieldElement] = await createSimpleContext(Form, Field);

      fieldElement.disconnectedCallback();

      expect(unsubscribe).toHaveBeenCalled();
    });

    it('unsubscribes on new subscription', async () => {
      @form()
      class Form extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly input!: FieldInputProps<object>;
        @api public readonly meta!: FieldMetaProps;

        @option public readonly name: string = 'test';
      }

      await createSimpleContext(Form, Field);
      const [subscribe] = subscriptionInfo.subscribers;

      subscribe();

      expect(unsubscribe).toHaveBeenCalled();
    });

    describe('@option', () => {
      it('resubscribes on name value change', async () => {
        @form()
        class Form extends CustomElement {
          @api public readonly formApi!: FormApi;
          @api public readonly state!: FormState;

          @option
          public onSubmit(): void {}
        }

        @field()
        class Field extends CustomElement {
          @api public readonly formApi!: FormApi;
          @api public readonly input!: FieldInputProps<object>;
          @api public readonly meta!: FieldMetaProps;

          @option
          public name: string = 'test1';
        }

        const [, fieldElement] = await createSimpleContext(Form, Field);

        fieldElement.name = 'test2';

        expect(scheduler).toHaveBeenCalledTimes(SINGLE_FIELD_UPDATE * 2);
      });

      it('does not resubscribe on name change if option values are equal', async () => {
        @form()
        class Form extends CustomElement {
          @api public readonly formApi!: FormApi;
          @api public readonly state!: FormState;

          @option
          public onSubmit(): void {}
        }

        @field()
        class Field extends CustomElement {
          @api public readonly formApi!: FormApi;
          @api public readonly input!: FieldInputProps<object>;
          @api public readonly meta!: FieldMetaProps;

          @option public name: string = 'test1';
        }

        const [, fieldElement] = await createSimpleContext(Form, Field);

        fieldElement.name = 'test1';

        expect(scheduler).toHaveBeenCalledTimes(SINGLE_FIELD_UPDATE);
      });

      it('resubscribes on subscription value change', async () => {
        @form()
        class Form extends CustomElement {
          @api public readonly formApi!: FormApi;
          @api public readonly state!: FormState;

          @option
          public onSubmit(): void {}
        }

        @field()
        class Field extends CustomElement {
          @api public readonly formApi!: FormApi;
          @api public readonly input!: FieldInputProps<object>;
          @api public readonly meta!: FieldMetaProps;

          @option public name: string = 'test';
          @option public subscription: Record<string, boolean> = all;
        }

        const [, fieldElement] = await createSimpleContext(Form, Field);

        fieldElement.subscription = {active: true};

        expect(scheduler).toHaveBeenCalledTimes(SINGLE_FIELD_UPDATE * 2);
      });

      it('does not resubscribe on subscription change if option values are equal', async () => {
        @form()
        class Form extends CustomElement {
          @api public readonly formApi!: FormApi;
          @api public readonly state!: FormState;

          @option
          public onSubmit(): void {}
        }

        @field()
        class Field extends CustomElement {
          @api public readonly formApi!: FormApi;
          @api public readonly input!: FieldInputProps<object>;
          @api public readonly meta!: FieldMetaProps;

          @option public name: string = 'test';
          @option public subscription: Record<string, boolean> = all;
        }

        const [, fieldElement] = await createSimpleContext(Form, Field);

        fieldElement.subscription = all;

        expect(scheduler).toHaveBeenCalledTimes(SINGLE_FIELD_UPDATE);
      });

      it('updates field if option value is changed', async () => {
        @form()
        class Form extends CustomElement {
          @api public readonly formApi!: FormApi;
          @api public readonly state!: FormState;

          @option
          public onSubmit(): void {}
        }

        @field()
        class Field extends CustomElement {
          @api public readonly formApi!: FormApi;
          @api public readonly input!: FieldInputProps<object>;
          @api public readonly meta!: FieldMetaProps;

          @option public readonly name: string = 'test';
          @option public value: string = 'test';
        }

        const [, fieldElement] = await createSimpleContext(Form, Field);

        scheduler.calls.reset();

        fieldElement.value = 'newTest';

        expect(scheduler).toHaveBeenCalled();
      });

      it('does not update field if it option values are equal', async () => {
        @form()
        class Form extends CustomElement {
          @api public readonly formApi!: FormApi;
          @api public readonly state!: FormState;

          @option
          public onSubmit(): void {}
        }

        @field()
        class Field extends CustomElement {
          @api public readonly formApi!: FormApi;
          @api public readonly input!: FieldInputProps<object>;
          @api public readonly meta!: FieldMetaProps;

          @option public readonly name: string = 'test';

          @option
          public value: string = 'test';
        }

        const [, fieldElement] = await createSimpleContext(Form, Field);

        scheduler.calls.reset();

        fieldElement.value = 'test';

        expect(scheduler).not.toHaveBeenCalled();
      });

      it('throws an error if option name is not one of Field config keys', () => {
        expect(() => {
          @field()
          // @ts-ignore
          class Field extends CustomElement {
            @api public readonly formApi!: FormApi;
            @api public readonly input!: FieldInputProps<object>;
            @api public readonly meta!: FieldMetaProps;

            @option public readonly name: string = 'test';

            @option
            public test: string = 'test';
          }
        }).toThrow(
          new TypeError('"test" is not one of the Final Form or Field configuration keys'),
        );
      });

      it('requires name field defined', () => {
        expect(() => {
          @field()
          // @ts-ignore
          class Field extends CustomElement {
            @api public readonly formApi!: FormApi;
            @api public readonly input!: FieldInputProps<object>;
            @api public readonly meta!: FieldMetaProps;
          }
        }).toThrowError('@field requires name property marked with @option');
      });
    });

    describe('@api', () => {
      it('requires form, input and meta fields defined', () => {
        expect(() => {
          @field()
          // @ts-ignore
          class Field extends CustomElement {}
        }).toThrowError('@field requires form property marked with @api');

        expect(() => {
          @field()
          // @ts-ignore
          class Field extends CustomElement {
            @api public readonly formApi!: FormApi;
          }
        }).toThrowError('@field requires input property marked with @api');

        expect(() => {
          @field()
          // @ts-ignore
          class Field extends CustomElement {
            @api public readonly formApi!: FormApi;
            @api public readonly input!: FieldInputProps<object>;
          }
        }).toThrowError('@field requires meta property marked with @api');
      });

      it('allows using accessors for all api elements', async () => {
        @form()
        class Form extends CustomElement {
          @api public readonly formApi!: FormApi;
          @api public readonly state!: FormState;

          @option
          public onSubmit(): void {}
        }

        @field()
        class Field extends CustomElement {
          public storage!: FormApi;

          @api
          public get formApi(): FormApi {
            return this.storage;
          }

          public set formApi(v: FormApi) {
            this.storage = v;
          }

          @api public readonly input!: FieldInputProps<object>;
          @api public readonly meta!: FieldMetaProps;

          @option public readonly name: string = 'test';
        }

        const [, fieldElement] = await createSimpleContext(Form, Field);

        expect(fieldElement.storage).toBe(formSpyObject);
      });

      it('allows only specific names for property api', async () => {
        expect(() => {
          @form()
          // @ts-ignore
          class Form extends CustomElement {
            @api public readonly notForm!: FormApi;

            @option
            public onSubmit(): void {}
          }
        }).toThrow(new TypeError('Property name notForm is not allowed'));

        expect(() => {
          @field()
          // @ts-ignore
          class Field extends CustomElement {
            @api public readonly notInput!: FieldInputProps<object>;

            @option
            public onSubmit(): void {}
          }
        }).toThrow(new TypeError('Property name notInput is not allowed'));
      });

      describe('input', () => {
        it('calls blur() method of field state if input.onBlur() is called', async () => {
          @form()
          class Form extends CustomElement {
            @api public readonly formApi!: FormApi;
            @api public readonly state!: FormState;

            @option
            public onSubmit(): void {}
          }

          @field()
          class Field extends CustomElement {
            @api public readonly formApi!: FormApi;
            @api public readonly input!: FieldInputProps<object>;
            @api public readonly meta!: FieldMetaProps;

            @option public readonly name: string = 'test';
          }

          const [, fieldElement] = await createSimpleContext(Form, Field);

          fieldElement.dispatchEvent(new Event('blur'));

          expect(state.blur).toHaveBeenCalled();
        });

        it('formats and sets value on blur if appropriate options are set', async () => {
          @form()
          class Form extends CustomElement {
            @api public readonly formApi!: FormApi;
            @api public readonly state!: FormState;

            @option
            public onSubmit(): void {}
          }

          @field()
          class Field extends CustomElement {
            @api public readonly formApi!: FormApi;
            @api public readonly input!: FieldInputProps<object>;
            @api public readonly meta!: FieldMetaProps;

            @option public readonly name: string = 'test';

            @option
            public formatOnBlur: boolean = true;

            @option
            public format(value: unknown): unknown {
              return value;
            }
          }

          const [, fieldElement] = await createSimpleContext(Form, Field);

          spyOn(fieldElement, 'format').and.callThrough();

          fieldElement.dispatchEvent(new Event('blur'));

          expect(fieldElement.format).toHaveBeenCalledWith(fieldValue, 'test');
          expect(state.change).toHaveBeenCalledWith(fieldValue);
        });

        it('calls change() method of field state when new "change" event is fired', async () => {
          @form()
          class Form extends CustomElement {
            @api public readonly formApi!: FormApi;
            @api public readonly state!: FormState;

            @option
            public onSubmit(): void {}
          }

          @field()
          class Field extends CustomElement {
            @api public readonly formApi!: FormApi;
            @api public readonly input!: FieldInputProps<object>;
            @api public readonly meta!: FieldMetaProps;

            @option public readonly name: string = 'test';
          }

          const [, fieldElement] = await createSimpleContext(Form, Field);

          const newFieldValue: object = {};

          fieldElement.dispatchEvent(new CustomEvent('change', {detail: newFieldValue}));

          expect(state.change).toHaveBeenCalledWith(newFieldValue);
        });

        it('parses value if parse option is defined', async () => {
          @form()
          class Form extends CustomElement {
            @api public readonly formApi!: FormApi;
            @api public readonly state!: FormState;

            @option
            public onSubmit(): void {}
          }

          @field()
          class Field extends CustomElement {
            @api public readonly formApi!: FormApi;
            @api public readonly input!: FieldInputProps<object>;
            @api public readonly meta!: FieldMetaProps;

            @option public readonly name: string = 'test';

            @option
            public parse(value: string): object {
              return JSON.parse(value);
            }
          }

          const [, fieldElement] = await createSimpleContext(Form, Field);

          spyOn(fieldElement, 'parse').and.callThrough();

          const newFieldValue = JSON.stringify({});

          fieldElement.dispatchEvent(new CustomEvent('change', {detail: newFieldValue}));

          expect(fieldElement.parse).toHaveBeenCalledWith(newFieldValue, 'test');
          expect(state.change).toHaveBeenCalledWith({});
        });

        it('calls focus() method of field stat if input.onFocus() method is called', async () => {
          @form()
          class Form extends CustomElement {
            @api public readonly formApi!: FormApi;
            @api public readonly state!: FormState;

            @option
            public onSubmit(): void {}
          }

          @field()
          class Field extends CustomElement {
            @api public readonly formApi!: FormApi;
            @api public readonly input!: FieldInputProps<object>;
            @api public readonly meta!: FieldMetaProps;

            @option public readonly name: string = 'test';
          }

          const [, fieldElement] = await createSimpleContext(Form, Field);

          fieldElement.dispatchEvent(new Event('focus'));

          expect(state.focus).toHaveBeenCalled();
        });
      });
    });

    describe('auto fields', () => {
      let formTag: string;
      let fieldTag: string;

      beforeEach(() => {
        @form()
        class Form extends CustomElement {
          @api public readonly formApi!: FormApi;
          @api public readonly state!: FormState;

          @option
          public onSubmit(): void {}
        }

        @field({auto: true})
        class Field extends CustomElement {
          @api public readonly formApi!: FormApi;
          @api public readonly input!: FieldInputProps<object>;
          @api public readonly meta!: FieldMetaProps;

          @option public readonly name: string = 'test';
        }

        formTag = defineCE(Form);
        fieldTag = defineCE(Field);

        state.value = undefined;
      });

      describe('text', () => {
        it('updates form property on input change event', async () => {
          const formElement = await fixture(`
            <${formTag}>
              <${fieldTag}>
                <input type="text"/>         
              </${fieldTag}>
            </${formTag}>
          `);

          const inputElement = formElement.querySelector<HTMLInputElement>('input')!;

          inputElement.value = 'test';
          inputElement.dispatchEvent(new Event('change', {bubbles: true}));
          expect(state.change).toHaveBeenCalledWith('test');
        });

        it('updates input value on a form change', async () => {
          state.value = 'a1';

          const formElement = await fixture(`
            <${formTag}>
              <${fieldTag}>
                <input type="text" value="a1"/>         
              </${fieldTag}>
            </${formTag}>
          `);

          const inputElement = formElement.querySelector<HTMLInputElement>('input')!;
          const [listener] = subscriptionInfo.listeners;

          callListener(listener, {...state, value: 'a2'});

          expect(inputElement.value).toBe('a2');
        });

        it('does not update input value if input is changed by user', async () => {
          state.value = 'a1';

          const formElement = await fixture(`
            <${formTag}>
              <${fieldTag}>
                <input type="text" value="a1"/>         
              </${fieldTag}>
            </${formTag}>
          `);

          const inputElement = formElement.querySelector<HTMLInputElement>('input')!;
          const [listener] = subscriptionInfo.listeners;

          // user changes text to a2
          inputElement.value = 'a2';
          inputElement.dispatchEvent(new Event('change', {bubbles: true}));

          const inputSet = spyOnProperty(inputElement, 'value', 'set');

          // form sends update for a field
          callListener(listener, {...state, value: 'a2'});

          // expecting field to ignore this update
          expect(inputSet).not.toHaveBeenCalled();
        });

        it('allows HTMLInputElement to update form value', async () => {
          @field({auto: true})
          class Field extends HTMLInputElement {
            @api public readonly formApi!: FormApi;
            @api public readonly input!: FieldInputProps<object>;
            @api public readonly meta!: FieldMetaProps;

            @option public readonly name: string = 'test';
          }

          const nativeFieldTag = genName();
          customElements.define(nativeFieldTag, Field, {extends: 'input'});

          const formElement = await fixture(`
            <${formTag}>
              <input is="${nativeFieldTag}" type="text" value="a1">
            </${formTag}>
          `);

          const fieldElement = formElement.querySelector<Field>('input')!;

          fieldElement.value = 'a2';
          fieldElement.dispatchEvent(new Event('change', {bubbles: true}));

          expect(state.change).toHaveBeenCalledWith('a2');
        });

        it('allows HTMLInputElement updating on form change', async () => {
          @field({auto: true})
          class Field extends HTMLInputElement {
            @api public readonly formApi!: FormApi;
            @api public readonly input!: FieldInputProps<object>;
            @api public readonly meta!: FieldMetaProps;

            @option public readonly name: string = 'test';
          }

          const nativeFieldTag = genName();
          customElements.define(nativeFieldTag, Field, {extends: 'input'});

          const formElement = await fixture(`
            <${formTag}>
              <input is="${nativeFieldTag}" type="text" value="a1">
            </${formTag}>
          `);

          const fieldElement = formElement.querySelector<Field>('input')!;
          const [listener] = subscriptionInfo.listeners;

          callListener(listener, {...state, value: 'a2'});

          expect(fieldElement.value).toBe('a2');
        });

        it('does not updates two times if @option value is set', async () => {
          @field({auto: true})
          class Field extends HTMLInputElement {
            @api public readonly formApi!: FormApi;
            @api public readonly input!: FieldInputProps<object>;
            @api public readonly meta!: FieldMetaProps;

            @option public readonly name: string = 'test';
            @option public value: string = 'a1';
          }

          const nativeFieldTag = genName();
          customElements.define(nativeFieldTag, Field, {extends: 'input'});

          const formElement = await fixture(`
            <${formTag}>
              <input is="${nativeFieldTag}" type="text">
            </${formTag}>
          `);

          const fieldElement = formElement.querySelector<Field>('input')!;

          scheduler.calls.reset();

          fieldElement.value = 'a2';
          fieldElement.dispatchEvent(new Event('change', {bubbles: true}));

          expect(state.change).toHaveBeenCalledWith('a2');
          expect(state.change).toHaveBeenCalledTimes(1);
          expect(scheduler).toHaveBeenCalledTimes(SINGLE_FIELD_UPDATE);
        });
      });

      describe('checkbox', () => {
        it('sets boolean value if no value exists', async () => {
          const formElement = await fixture(`
            <${formTag}>
              <${fieldTag}>
                <input type="checkbox"/>         
              </${fieldTag}>
            </${formTag}>
          `);

          const inputElement = formElement.querySelector<HTMLInputElement>('input')!;

          inputElement.checked = true;
          inputElement.dispatchEvent(new Event('change', {bubbles: true}));
          expect(state.change).toHaveBeenCalledWith(true);
        });

        it('sets array value if value exists', async () => {
          const formElement = await fixture(`
            <${formTag}>
              <${fieldTag}>
                <input type="checkbox" value="foo"/>         
              </${fieldTag}>
            </${formTag}>
          `);

          const inputElement = formElement.querySelector<HTMLInputElement>('input')!;

          inputElement.checked = true;
          inputElement.dispatchEvent(new Event('change', {bubbles: true}));
          expect(state.change).toHaveBeenCalledWith(['foo']);
        });

        it('updates array value if checked', async () => {
          state.value = ['bar'];

          const formElement = await fixture(`
            <${formTag}>
              <${fieldTag}>
                <input type="checkbox" value="foo"/>         
              </${fieldTag}>
            </${formTag}>
          `);

          const inputElement = formElement.querySelector<HTMLInputElement>('input')!;

          inputElement.checked = true;
          inputElement.dispatchEvent(new Event('change', {bubbles: true}));
          expect(state.change).toHaveBeenCalledWith(['bar', 'foo']);
        });

        it('removes value if unchecked', async () => {
          state.value = ['foo'];

          const formElement = await fixture(`
            <${formTag}>
              <${fieldTag}>
                <input type="checkbox" value="foo" checked/>         
              </${fieldTag}>
            </${formTag}>
          `);

          const inputElement = formElement.querySelector<HTMLInputElement>('input')!;

          inputElement.checked = false;
          inputElement.dispatchEvent(new Event('change', {bubbles: true}));
          expect(state.change).toHaveBeenCalledWith([]);
        });

        it('does nothing if form value is not an array and checkbox is unchecked', async () => {
          state.value = undefined;

          const formElement = await fixture(`
            <${formTag}>
              <${fieldTag}>
                <input type="checkbox" value="foo" checked/>         
              </${fieldTag}>
            </${formTag}>
          `);

          const inputElement = formElement.querySelector<HTMLInputElement>('input')!;

          inputElement.checked = false;
          inputElement.dispatchEvent(new Event('change', {bubbles: true}));
          expect(state.change).toHaveBeenCalledWith(undefined);
        });

        it('updates boolean value on a form change', async () => {
          state.value = false;

          const formElement = await fixture(`
            <${formTag}>
              <${fieldTag}>
                <input type="checkbox"/>         
              </${fieldTag}>
            </${formTag}>
          `);

          const inputElement = formElement.querySelector<HTMLInputElement>('input')!;
          const [listener] = subscriptionInfo.listeners;

          expect(inputElement.checked).not.toBeTruthy();

          callListener(listener, {...state, value: true});
          expect(inputElement.checked).toBeTruthy();

          callListener(listener, {...state, value: false});
          expect(inputElement.checked).not.toBeTruthy();
        });

        it('updates array value on a form change', async () => {
          state.value = [];

          const formElement = await fixture(`
            <${formTag}>
              <${fieldTag}>
                <input type="checkbox" value="foo"/>         
                <input type="checkbox" value="bar"/>         
              </${fieldTag}>
            </${formTag}>
          `);

          const inputElementFoo = formElement.querySelector<HTMLInputElement>('input[value=foo]')!;
          const inputElementBar = formElement.querySelector<HTMLInputElement>('input[value=bar]')!;
          const [listener] = subscriptionInfo.listeners;

          expect(inputElementFoo.checked).not.toBeTruthy();
          expect(inputElementBar.checked).not.toBeTruthy();

          callListener(listener, {...state, value: ['foo']});
          expect(inputElementFoo.checked).toBeTruthy();
          expect(inputElementBar.checked).not.toBeTruthy();

          callListener(listener, {...state, value: ['foo', 'bar']});
          expect(inputElementFoo.checked).toBeTruthy();
          expect(inputElementBar.checked).toBeTruthy();

          callListener(listener, {...state, value: ['bar']});
          expect(inputElementFoo.checked).not.toBeTruthy();
          expect(inputElementBar.checked).toBeTruthy();
        });

        it('allows HTMLInputElement to update form value', async () => {
          @field({auto: true})
          class Field extends HTMLInputElement {
            @api public readonly formApi!: FormApi;
            @api public readonly input!: FieldInputProps<object>;
            @api public readonly meta!: FieldMetaProps;

            @option public readonly name: string = 'test';
          }

          const nativeFieldTag = genName();
          customElements.define(nativeFieldTag, Field, {extends: 'input'});

          const formElement = await fixture(`
            <${formTag}>
              <input is="${nativeFieldTag}" type="checkbox">
            </${formTag}>
          `);

          const fieldElement = formElement.querySelector<Field>('input')!;

          fieldElement.checked = true;
          fieldElement.dispatchEvent(new Event('change', {bubbles: true}));
          expect(state.change).toHaveBeenCalledWith(true);
        });

        it('allows HTMLInputElement updating on form change', async () => {
          @field({auto: true})
          class Field extends HTMLInputElement {
            @api public readonly formApi!: FormApi;
            @api public readonly input!: FieldInputProps<object>;
            @api public readonly meta!: FieldMetaProps;

            @option public readonly name: string = 'test';
          }

          const nativeFieldTag = genName();
          customElements.define(nativeFieldTag, Field, {extends: 'input'});

          const formElement = await fixture(`
            <${formTag}>
              <input is="${nativeFieldTag}" type="checkbox">
            </${formTag}>
          `);

          const fieldElement = formElement.querySelector<Field>('input')!;
          const [listener] = subscriptionInfo.listeners;

          expect(fieldElement.checked).not.toBeTruthy();

          callListener(listener, {...state, value: true});
          expect(fieldElement.checked).toBeTruthy();

          callListener(listener, {...state, value: false});
          expect(fieldElement.checked).not.toBeTruthy();
        });

        it('sets field name to all inner elements (if container)', async () => {
          const formElement = await fixture(`
            <${formTag}>
              <${fieldTag}>
                <input type="checkbox" value="foo"/>         
                <input type="checkbox" value="bar"/>
              </${fieldTag}>
            </${formTag}>
          `);

          const inputElementFoo = formElement.querySelector<HTMLInputElement>('input[value=foo]')!;
          const inputElementBar = formElement.querySelector<HTMLInputElement>('input[value=bar]')!;

          expect(inputElementFoo.name).toBe('test');
          expect(inputElementBar.name).toBe('test');
        });
      });

      describe('radio', () => {
        it('changes form value on click', async () => {
          const formElement = await fixture(`
            <${formTag}>
              <${fieldTag}>
                <input type="radio" value="foo"/>         
                <input type="radio" value="bar"/>         
              </${fieldTag}>
            </${formTag}>
          `);

          const inputElementFoo = formElement.querySelector<HTMLInputElement>('input[value=foo]')!;
          const inputElementBar = formElement.querySelector<HTMLInputElement>('input[value=bar]')!;

          inputElementFoo.checked = true;
          inputElementFoo.dispatchEvent(new Event('change', {bubbles: true}));
          expect(state.change).toHaveBeenCalledWith('foo');

          inputElementBar.checked = true;
          inputElementBar.dispatchEvent(new Event('change', {bubbles: true}));
          expect(state.change).toHaveBeenCalledWith('bar');
        });

        it('updates input value on form change', async () => {
          const formElement = await fixture(`
            <${formTag}>
              <${fieldTag}>
                <input type="radio" value="foo"/>         
                <input type="radio" value="bar"/>         
              </${fieldTag}>
            </${formTag}>
          `);

          const inputElementFoo = formElement.querySelector<HTMLInputElement>('input[value=foo]')!;
          const inputElementBar = formElement.querySelector<HTMLInputElement>('input[value=bar]')!;
          const [listener] = subscriptionInfo.listeners;

          expect(inputElementFoo.checked).not.toBeTruthy();
          expect(inputElementBar.checked).not.toBeTruthy();

          callListener(listener, {...state, value: 'foo'});
          expect(inputElementFoo.checked).toBeTruthy();
          expect(inputElementBar.checked).not.toBeTruthy();

          callListener(listener, {...state, value: 'bar'});
          expect(inputElementFoo.checked).not.toBeTruthy();
          expect(inputElementBar.checked).toBeTruthy();
        });

        it('allows HTMLInputElement to update form value', async () => {
          @field({auto: true})
          class Field extends HTMLInputElement {
            @api public readonly formApi!: FormApi;
            @api public readonly input!: FieldInputProps<object>;
            @api public readonly meta!: FieldMetaProps;

            @option public readonly name: string = 'test';
          }

          const nativeFieldTag = genName();
          customElements.define(nativeFieldTag, Field, {extends: 'input'});

          const formElement = await fixture(`
            <${formTag}>
              <input is="${nativeFieldTag}" type="radio" value="foo">
              <input is="${nativeFieldTag}" type="radio" value="bar">
            </${formTag}>
          `);

          const fieldElementFoo = formElement.querySelector<Field>('input[value=foo]')!;
          const fieldElementBar = formElement.querySelector<Field>('input[value=bar]')!;

          fieldElementFoo.checked = true;
          fieldElementFoo.dispatchEvent(new Event('change', {bubbles: true}));
          expect(state.change).toHaveBeenCalledWith('foo');

          fieldElementBar.checked = true;
          fieldElementBar.dispatchEvent(new Event('change', {bubbles: true}));
          expect(state.change).toHaveBeenCalledWith('bar');
        });

        it('allows HTMLInputElement updating on form change', async () => {
          @field({auto: true})
          class Field extends HTMLInputElement {
            @api public readonly formApi!: FormApi;
            @api public readonly input!: FieldInputProps<object>;
            @api public readonly meta!: FieldMetaProps;

            @option public readonly name: string = 'test';
          }

          const nativeFieldTag = genName();
          customElements.define(nativeFieldTag, Field, {extends: 'input'});

          const formElement = await fixture(`
            <${formTag}>
              <input is="${nativeFieldTag}" type="radio" value="foo">
              <input is="${nativeFieldTag}" type="radio" value="bar">
            </${formTag}>
          `);

          const fieldElementFoo = formElement.querySelector<Field>('input[value=foo]')!;
          const fieldElementBar = formElement.querySelector<Field>('input[value=bar]')!;
          const [fooListener, barListener] = subscriptionInfo.listeners;

          expect(fieldElementFoo.checked).not.toBeTruthy();
          expect(fieldElementBar.checked).not.toBeTruthy();

          callListener(fooListener, {...state, value: 'foo'});
          callListener(barListener, {...state, value: 'foo'});
          expect(fieldElementFoo.checked).toBeTruthy();
          expect(fieldElementBar.checked).not.toBeTruthy();

          callListener(fooListener, {...state, value: 'bar'});
          callListener(barListener, {...state, value: 'bar'});
          expect(fieldElementFoo.checked).not.toBeTruthy();
          expect(fieldElementBar.checked).toBeTruthy();
        });
      });

      describe('select', () => {
        describe('container', () => {
          let selectElement: HTMLSelectElement;
          let option1: HTMLOptionElement;
          let option2: HTMLOptionElement;

          const enableMultiple = () => {
            selectElement.multiple = true;
            option1.selected = false;
            option2.selected = false;
          };

          beforeEach(async () => {
            const formElement = await fixture(`
            <${formTag}>
              <${fieldTag}>
                <select>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                </select>
              </${fieldTag}>
            </${formTag}>
          `);

            selectElement = formElement.querySelector('select')!;
            [option1, option2] = Array.from<HTMLOptionElement>(
              formElement.querySelectorAll('option'),
            );
          });

          it('sets the form value to the selected option if selection is single', () => {
            option2.selected = true;
            selectElement.dispatchEvent(new Event('change', {bubbles: true}));

            expect(state.change).toHaveBeenCalledWith('2');
          });

          it('sets the form value to the array of selected option if selection is multiple', () => {
            enableMultiple();

            option1.selected = true;
            option2.selected = true;

            selectElement.dispatchEvent(new Event('change', {bubbles: true}));

            expect(state.change).toHaveBeenCalledWith(['1', '2']);
          });

          it('updates select value on form change if selection is single', () => {
            const [listener] = subscriptionInfo.listeners;

            expect(option1.selected).not.toBeTruthy();
            expect(option2.selected).not.toBeTruthy();

            callListener(listener, {...state, value: '1'});
            expect(option1.selected).toBeTruthy();
            expect(option2.selected).not.toBeTruthy();

            callListener(listener, {...state, value: '2'});
            expect(option1.selected).not.toBeTruthy();
            expect(option2.selected).toBeTruthy();
          });

          it('updates select values on form change if selection is multiple', () => {
            enableMultiple();

            const [listener] = subscriptionInfo.listeners;

            expect(option1.selected).not.toBeTruthy();
            expect(option2.selected).not.toBeTruthy();

            callListener(listener, {...state, value: ['1', '2']});
            expect(option1.selected).toBeTruthy();
            expect(option2.selected).toBeTruthy();

            callListener(listener, {...state, value: ['2']});
            expect(option1.selected).not.toBeTruthy();
            expect(option2.selected).toBeTruthy();
          });
        });

        describe('HTMLSelectElement', () => {
          let selectElement: HTMLSelectElement;
          let option1: HTMLOptionElement;
          let option2: HTMLOptionElement;

          beforeEach(async () => {
            @field({auto: true})
            class Field extends HTMLSelectElement {
              @api public readonly formApi!: FormApi;
              @api public readonly input!: FieldInputProps<object>;
              @api public readonly meta!: FieldMetaProps;

              @option public readonly name: string = 'test';
            }

            const nativeFieldTag = genName();
            customElements.define(nativeFieldTag, Field, {extends: 'select'});

            const formElement = (await fixture(`
              <${formTag}>
                <select is="${nativeFieldTag}">
                  <option value="1">One</option>
                  <option value="2">Two</option>
                </select>
              </${formTag}>
            `)) as HTMLSelectElement;

            selectElement = formElement.querySelector('select')!;
            [option1, option2] = Array.from<HTMLOptionElement>(
              formElement.querySelectorAll('option'),
            );
          });

          it('allows to update form value', () => {
            option2.selected = true;
            selectElement.dispatchEvent(new Event('change', {bubbles: true}));

            expect(state.change).toHaveBeenCalledWith('2');
          });

          it('allows to update select value on form change', () => {
            const [listener] = subscriptionInfo.listeners;

            expect(option1.selected).not.toBeTruthy();
            expect(option2.selected).not.toBeTruthy();

            callListener(listener, {...state, value: '1'});
            expect(option1.selected).toBeTruthy();
            expect(option2.selected).not.toBeTruthy();

            callListener(listener, {...state, value: '2'});
            expect(option1.selected).not.toBeTruthy();
            expect(option2.selected).toBeTruthy();
          });
        });
      });

      it('does not throw an error if class already have own lifecycle element', () => {
        expect(() => {
          @field()
          // @ts-ignore
          class Field extends CustomElement {
            @api public readonly formApi!: FormApi;
            @api public readonly input!: FieldInputProps<string>;
            @api public readonly meta!: FieldMetaProps;

            @option public readonly name: string = 'test';

            public constructor() {
              super();
              this.connectedCallback = this.connectedCallback.bind(this);
              this.disconnectedCallback = this.disconnectedCallback.bind(this);
            }

            public connectedCallback(): void {}

            public disconnectedCallback(): void {}
          }
        }).not.toThrow();
      });
    });
  });
};

export default testField;
