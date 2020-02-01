// tslint:disable:no-unbound-method
import {defineCE, fixture, html, unsafeStatic} from '@open-wc/testing-helpers';
import {FieldState, FormApi, FormState} from 'final-form';
import {formSpyObject, unsubscribe} from '../../../test/mocks/finalForm';
import {createSimpleContext, CustomElement, genName} from '../../../test/utils';
import {
  field as basicField,
  FieldInputProps,
  FieldMetaProps,
  form,
  gear,
  option,
} from '../src';
import {all} from '../src/field';

describe('@corpuscule/form', () => {
  describe('@field', () => {
    let scheduler: jasmine.Spy;
    let state: jasmine.SpyObj<FieldState<unknown>>;
    let fieldValue: object;
    let metaObject: FieldMetaProps<unknown>;

    let field: typeof basicField;

    const getListener = (index: number | null = null) => {
      const {calls} = formSpyObject.registerField;
      const [, listener] =
        index !== null ? calls.argsFor(index) : calls.mostRecent().args;

      return listener;
    };

    beforeEach(() => {
      scheduler = jasmine.createSpy('scheduler');

      field = options => basicField({...options, scheduler});

      unsubscribe.calls.reset();
      formSpyObject.registerField.calls.reset();
      fieldValue = {};
      state = jasmine.createSpyObj('formState', ['blur', 'change', 'focus']);

      formSpyObject.registerField.and.callFake(
        (_, listener: (state: FieldState<unknown>) => void) => {
          listener(state);

          return unsubscribe;
        },
      );

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
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly state!: FormState<unknown>;

        @option()
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly input!: FieldInputProps<string>;
        @gear() public readonly meta!: FieldMetaProps<unknown>;

        @option() public readonly name: string = 'test';
      }

      const [, fieldElement] = await createSimpleContext(Form, Field);

      expect(fieldElement.formApi).toBe(formSpyObject);
      expect(formSpyObject.subscribe).toHaveBeenCalled();
    });

    it('receives form before user-defined connectedCallback is run', async () => {
      const connectedCallbackSpy = jasmine.createSpy('connectedCallback');

      @form()
      class Form extends CustomElement {
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly state!: FormState<unknown>;

        @option()
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly input!: FieldInputProps<string>;
        @gear() public readonly meta!: FieldMetaProps<unknown>;

        @option() public readonly name: string = 'test';

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
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly state!: FormState<unknown>;

        @option()
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly input!: FieldInputProps<string>;
        @gear() public readonly meta!: FieldMetaProps<unknown>;

        @option() public readonly name: string = 'test';

        @option()
        public isEqual(): boolean {
          return true;
        }

        @option()
        public validate(): boolean {
          return true;
        }

        @option()
        public validateFields(): boolean {
          return true;
        }
      }

      const [, fieldElement] = await createSimpleContext(Form, Field);

      expect(formSpyObject.registerField).toHaveBeenCalledWith(
        'test',
        jasmine.any(Function),
        all,
        {
          getValidator: jasmine.any(Function),
          isEqual: fieldElement.isEqual,
          validateFields: fieldElement.validateFields,
        },
      );

      const [
        ,
        ,
        ,
        {getValidator},
      ] = formSpyObject.registerField.calls.mostRecent().args;

      expect(getValidator()).toBe(fieldElement.validate);
    });

    it('creates new input and meta objects on each form update', async () => {
      @form()
      class Form extends CustomElement {
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly state!: FormState<unknown>;

        @option()
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly input!: FieldInputProps<object>;
        @gear() public readonly meta!: FieldMetaProps<unknown>;

        @option() public readonly name: string = 'test';
      }

      const [, fieldElement] = await createSimpleContext(Form, Field);

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
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly state!: FormState<unknown>;

        @option()
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly input!: FieldInputProps<object>;
        @gear() public readonly meta!: FieldMetaProps<unknown>;

        @option() public readonly name: string = 'test';

        @option()
        public formatOnBlur: boolean = false;

        @option()
        public format(value: unknown, name: string): unknown {
          formatSpy(value, name);

          return value;
        }
      }

      await createSimpleContext(Form, Field);

      expect(formatSpy).toHaveBeenCalledWith(fieldValue, 'test');
    });

    it('avoids unnecessary scheduling if subscribe called many times', async () => {
      scheduler.and.stub();

      @form()
      class Form extends CustomElement {
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly state!: FormState<unknown>;

        @option()
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly input!: FieldInputProps<object>;
        @gear() public readonly meta!: FieldMetaProps<unknown>;

        @option() public name: string = 'test';
      }

      const [, fieldElement] = await createSimpleContext(Form, Field);
      fieldElement.name = 'test1';
      fieldElement.name = 'test2';

      expect(scheduler).toHaveBeenCalledTimes(1);
    });

    it('unsubscribes on disconnectedCallback', async () => {
      @form()
      class Form extends CustomElement {
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly state!: FormState<unknown>;

        @option()
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly input!: FieldInputProps<object>;
        @gear() public readonly meta!: FieldMetaProps<unknown>;

        @option() public readonly name: string = 'test';
      }

      const [, fieldElement] = await createSimpleContext(Form, Field);

      fieldElement.remove();

      expect(unsubscribe).toHaveBeenCalled();
    });

    it('unsubscribes on new subscription', async () => {
      scheduler.and.callFake((callback: () => void) => {
        callback();
      });

      @form()
      class Form extends CustomElement {
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly state!: FormState<unknown>;

        @option()
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly input!: FieldInputProps<object>;
        @gear() public readonly meta!: FieldMetaProps<unknown>;

        @option() public name: string = 'test';
      }

      const [, fieldElement] = await createSimpleContext(Form, Field);

      fieldElement.name = 'test1';

      expect(unsubscribe).toHaveBeenCalled();
    });

    it('does not change form value if event is not custom and field is not auto', async () => {
      @form()
      class Form extends CustomElement {
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly state!: FormState<unknown>;

        @option()
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly input!: FieldInputProps<string>;
        @gear() public readonly meta!: FieldMetaProps<unknown>;

        @option() public readonly name: string = 'test';
      }

      const formTag = defineCE(Form);
      const fieldTag = defineCE(Field);

      const formElement = await fixture(`
        <${formTag}>
          <${fieldTag}>
            <input type="text">
          </${fieldTag}>
        </${formTag}>
      `);

      const inputElement = formElement.querySelector<HTMLInputElement>(
        'input',
      )!;

      inputElement.value = 'test';
      inputElement.dispatchEvent(new Event('input', {bubbles: true}));

      expect(state.change).not.toHaveBeenCalled();
    });

    it('does not run update before the first subscription', async () => {
      @form()
      class Form extends CustomElement {
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly state!: FormState<unknown>;

        @option()
        public onSubmit(): void {}
      }

      @field()
      class Field extends CustomElement {
        @gear() public readonly formApi!: FormApi;
        @gear() public readonly input!: FieldInputProps<string>;
        @gear() public readonly meta!: FieldMetaProps<unknown>;

        @option() public readonly name: string = 'test';
      }

      const formTag = unsafeStatic(defineCE(Form));
      const fieldTag = unsafeStatic(defineCE(Field));

      const validate = value => (value ? undefined : 'Required');

      await fixture(html`
        <${formTag}>
          <${fieldTag} .validate="${validate}"></${fieldTag}>
        </${formTag}>
      `);

      expect(scheduler).not.toHaveBeenCalled();
    });

    describe('@option', () => {
      it('resubscribes on name value change', async () => {
        @form()
        class Form extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly state!: FormState<unknown>;

          @option()
          public onSubmit(): void {}
        }

        @field()
        class Field extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly input!: FieldInputProps<object>;
          @gear() public readonly meta!: FieldMetaProps<unknown>;

          @option()
          public name: string = 'test1';
        }

        const [, fieldElement] = await createSimpleContext(Form, Field);

        fieldElement.name = 'test2';

        expect(scheduler).toHaveBeenCalledTimes(1);
      });

      it('does not resubscribe on name change if option values are equal', async () => {
        @form()
        class Form extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly state!: FormState<unknown>;

          @option()
          public onSubmit(): void {}
        }

        @field()
        class Field extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly input!: FieldInputProps<object>;
          @gear() public readonly meta!: FieldMetaProps<unknown>;

          @option() public name: string = 'test1';
        }

        const [, fieldElement] = await createSimpleContext(Form, Field);

        fieldElement.name = 'test1';

        expect(scheduler).not.toHaveBeenCalled();
      });

      it('resubscribes on subscription value change', async () => {
        @form()
        class Form extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly state!: FormState<unknown>;

          @option()
          public onSubmit(): void {}
        }

        @field()
        class Field extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly input!: FieldInputProps<object>;
          @gear() public readonly meta!: FieldMetaProps<unknown>;

          @option() public name: string = 'test';
          @option() public subscription: Record<string, boolean> = all;
        }

        const [, fieldElement] = await createSimpleContext(Form, Field);

        fieldElement.subscription = {active: true};

        expect(scheduler).toHaveBeenCalledTimes(1);
      });

      it('does not resubscribe on subscription change if option values are equal', async () => {
        @form()
        class Form extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly state!: FormState<unknown>;

          @option()
          public onSubmit(): void {}
        }

        @field()
        class Field extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly input!: FieldInputProps<object>;
          @gear() public readonly meta!: FieldMetaProps<unknown>;

          @option() public name: string = 'test';
          @option() public subscription: Record<string, boolean> = all;
        }

        const [, fieldElement] = await createSimpleContext(Form, Field);

        fieldElement.subscription = all;

        expect(scheduler).not.toHaveBeenCalled();
      });

      it('throws an error if option name is not one of Field config keys', () => {
        expect(() => {
          @field()
          // @ts-ignore
          class Field extends CustomElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly input!: FieldInputProps<object>;
            @gear() public readonly meta!: FieldMetaProps<unknown>;

            @option() public readonly name: string = 'test';

            @option()
            public test: string = 'test';
          }
        }).toThrow(
          new TypeError(
            '"test" is not one of the Final Form or Field configuration keys',
          ),
        );
      });

      it('requires name field defined', () => {
        expect(() => {
          @field()
          // @ts-ignore
          class Field extends CustomElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly input!: FieldInputProps<object>;
            @gear() public readonly meta!: FieldMetaProps<unknown>;
          }
        }).toThrowError('@field requires name property marked with @option');
      });

      it('does not run registerField on connection if name has no value', async () => {
        @form()
        class Form extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly state!: FormState<unknown>;

          @option()
          public onSubmit(): void {}
        }

        @field()
        class Field extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly input!: FieldInputProps<string>;
          @gear() public readonly meta!: FieldMetaProps<unknown>;

          @option() public readonly name?: string;
        }

        const formTag = defineCE(Form);
        const fieldTag = defineCE(Field);

        await fixture(`
        <${formTag}>
          <${fieldTag}></${fieldTag}>
        </${formTag}>
      `);

        expect(formSpyObject.registerField).not.toHaveBeenCalled();
      });

      it('properly sets validate option', async () => {
        @form()
        class Form extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly state!: FormState<unknown>;

          @option()
          public onSubmit(): void {}
        }

        @field()
        class Field extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly input!: FieldInputProps<string>;
          @gear() public readonly meta!: FieldMetaProps<unknown>;

          @option() public readonly name: string = 'test';

          @option()
          public validate(): void {}
        }

        const formTag = defineCE(Form);
        const fieldTag = defineCE(Field);

        const formElement = await fixture(`
          <${formTag}>
            <${fieldTag}></${fieldTag}>
          </${formTag}>
        `);

        const fieldElement = formElement.querySelector<Field>(fieldTag)!;

        const [
          ,
          ,
          ,
          {getValidator},
        ] = formSpyObject.registerField.calls.mostRecent().args;

        expect(getValidator()).toBe(fieldElement.validate);
      });

      it('allows using specific name of the property along with the responsibility key', async () => {
        @form()
        class Form extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly state!: FormState<unknown>;

          @option()
          public onSubmit(): void {}
        }

        @field()
        class Field extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly input!: FieldInputProps<object>;
          @gear() public readonly meta!: FieldMetaProps<unknown>;

          @option('name') public readonly n: string = 'test';
        }

        await createSimpleContext(Form, Field);

        expect(formSpyObject.registerField).toHaveBeenCalledWith(
          'test',
          jasmine.any(Function),
          all,
          jasmine.any(Object),
        );
      });
    });

    describe('@gear', () => {
      it('requires form, input and meta fields defined', () => {
        expect(() => {
          @field()
          // @ts-ignore
          class Field extends CustomElement {}
        }).toThrowError('@field requires form property marked with @gear');

        expect(() => {
          @field()
          // @ts-ignore
          class Field extends CustomElement {
            @gear() public readonly formApi!: FormApi;
          }
        }).toThrowError('@field requires input property marked with @gear');

        expect(() => {
          @field()
          // @ts-ignore
          class Field extends CustomElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly input!: FieldInputProps<object>;
          }
        }).toThrowError('@field requires meta property marked with @gear');
      });

      it('allows using accessors for all gear elements', async () => {
        @form()
        class Form extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly state!: FormState<unknown>;

          @option()
          public onSubmit(): void {}
        }

        @field()
        class Field extends CustomElement {
          public storage!: FormApi;

          @gear()
          public get formApi(): FormApi {
            return this.storage;
          }

          public set formApi(v: FormApi) {
            this.storage = v;
          }

          @gear() public readonly input!: FieldInputProps<object>;
          @gear() public readonly meta!: FieldMetaProps<unknown>;

          @option() public readonly name: string = 'test';
        }

        const [, fieldElement] = await createSimpleContext(Form, Field);

        expect(fieldElement.storage).toBe(formSpyObject);
      });

      it('allows only specific names for property gear', async () => {
        expect(() => {
          @form()
          // @ts-ignore
          class Form extends CustomElement {
            @gear() public readonly notForm!: FormApi;

            @option()
            public onSubmit(): void {}
          }
        }).toThrow(new TypeError('Property name notForm is not allowed'));

        expect(() => {
          @field()
          // @ts-ignore
          class Field extends CustomElement {
            @gear() public readonly notInput!: FieldInputProps<object>;

            @option()
            public onSubmit(): void {}
          }
        }).toThrow(new TypeError('Property name notInput is not allowed'));
      });

      describe('input', () => {
        it('calls blur() method of field state if the "focusout" event is fired', async () => {
          @form()
          class Form extends CustomElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly state!: FormState<unknown>;

            @option()
            public onSubmit(): void {}
          }

          @field()
          class Field extends CustomElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly input!: FieldInputProps<object>;
            @gear() public readonly meta!: FieldMetaProps<unknown>;

            @option() public readonly name: string = 'test';
          }

          const [, fieldElement] = await createSimpleContext(Form, Field);

          fieldElement.dispatchEvent(new Event('focusout', {bubbles: true}));

          expect(state.blur).toHaveBeenCalled();
        });

        it('formats and sets value on blur if appropriate options are set', async () => {
          @form()
          class Form extends CustomElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly state!: FormState<unknown>;

            @option()
            public onSubmit(): void {}
          }

          @field()
          class Field extends CustomElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly input!: FieldInputProps<object>;
            @gear() public readonly meta!: FieldMetaProps<unknown>;

            @option() public readonly name: string = 'test';

            @option()
            public formatOnBlur: boolean = true;

            @option()
            public format(value: unknown): unknown {
              return value;
            }
          }

          const [, fieldElement] = await createSimpleContext(Form, Field);

          const formatSpy: jasmine.Spy<(
            value: unknown,
            name: string,
          ) => unknown> = spyOn(fieldElement, 'format').and.callThrough();

          fieldElement.dispatchEvent(new Event('focusout', {bubbles: true}));

          expect(formatSpy).toHaveBeenCalledWith(fieldValue, 'test');
          expect(state.change).toHaveBeenCalledWith(fieldValue);
        });

        it('calls change() method of field state when new "change" event is fired', async () => {
          @form()
          class Form extends CustomElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly state!: FormState<unknown>;

            @option()
            public onSubmit(): void {}
          }

          @field()
          class Field extends CustomElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly input!: FieldInputProps<object>;
            @gear() public readonly meta!: FieldMetaProps<unknown>;

            @option() public readonly name: string = 'test';
          }

          const [, fieldElement] = await createSimpleContext(Form, Field);

          const newFieldValue: object = {};

          fieldElement.dispatchEvent(
            new CustomEvent('input', {detail: newFieldValue}),
          );

          expect(state.change).toHaveBeenCalledWith(newFieldValue);
        });

        it('parses value if parse option is defined', async () => {
          @form()
          class Form extends CustomElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly state!: FormState<unknown>;

            @option()
            public onSubmit(): void {}
          }

          @field()
          class Field extends CustomElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly input!: FieldInputProps<object>;
            @gear() public readonly meta!: FieldMetaProps<unknown>;

            @option() public readonly name: string = 'test';

            @option()
            public parse(value: string): object {
              return JSON.parse(value);
            }
          }

          const [, fieldElement] = await createSimpleContext(Form, Field);

          const parseSpy: jasmine.Spy<(
            value: string,
            name: string,
          ) => object> = spyOn(fieldElement, 'parse').and.callThrough();

          const newFieldValue = JSON.stringify({});

          fieldElement.dispatchEvent(
            new CustomEvent('input', {detail: newFieldValue}),
          );

          expect(parseSpy).toHaveBeenCalledWith(newFieldValue, 'test');
          expect(state.change).toHaveBeenCalledWith({});
        });

        it('calls focus() method of field stat if "focusin" event is fired', async () => {
          @form()
          class Form extends CustomElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly state!: FormState<unknown>;

            @option()
            public onSubmit(): void {}
          }

          @field()
          class Field extends CustomElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly input!: FieldInputProps<object>;
            @gear() public readonly meta!: FieldMetaProps<unknown>;

            @option() public readonly name: string = 'test';
          }

          const [, fieldElement] = await createSimpleContext(Form, Field);

          fieldElement.dispatchEvent(new Event('focusin', {bubbles: true}));

          expect(state.focus).toHaveBeenCalled();
        });
      });

      it('catches event even if it is fired not in the component itself', async () => {
        @form()
        class Form extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly state!: FormState<unknown>;

          @option()
          public onSubmit(): void {}
        }

        @field()
        class Field extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly input!: FieldInputProps<object>;
          @gear() public readonly meta!: FieldMetaProps<unknown>;

          @option() public readonly name: string = 'test';
        }

        const fieldTag = defineCE(Field);
        const formTag = defineCE(Form);

        const formElement = await fixture(`
          <${formTag}>
            <${fieldTag}>
              <input type="text">
            </${fieldTag}>
          </${formTag}>
        `);

        const inputElement = formElement.querySelector<HTMLInputElement>(
          'input',
        )!;

        inputElement.dispatchEvent(new Event('focusin', {bubbles: true}));

        expect(state.focus).toHaveBeenCalled();
      });

      it('allows using specific name of the property along with the responsibility key', async () => {
        @form()
        class Form extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly state!: FormState<unknown>;

          @option()
          public onSubmit(): void {}
        }

        @field()
        class Field extends CustomElement {
          @gear('formApi') public readonly fa!: FormApi;
          @gear('input') public readonly i!: FieldInputProps<object>;
          @gear('meta') public readonly m!: FieldMetaProps<unknown>;

          @option() public readonly name: string = 'test';
        }

        const [, fieldElement] = await createSimpleContext(Form, Field);

        expect(fieldElement.fa).toBe(formSpyObject);
        expect(fieldElement.i).toEqual({name: 'test', value: fieldValue});
        expect(fieldElement.m).toEqual(metaObject);
      });
    });

    describe('auto fields', () => {
      let formTag: string;
      let fieldTag: string;

      beforeEach(() => {
        @form()
        class Form extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly state!: FormState<unknown>;

          @option()
          public onSubmit(): void {}
        }

        @field({auto: true})
        class Field extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly input!: FieldInputProps<object>;
          @gear() public readonly meta!: FieldMetaProps<unknown>;

          @option() public readonly name: string = 'test';
        }

        formTag = defineCE(Form);
        fieldTag = defineCE(Field);

        state.value = undefined;
      });

      it('allows to define ref property for container', async () => {
        @field({auto: true})
        class Field extends CustomElement {
          @gear() public readonly formApi!: FormApi;
          @gear() public readonly input!: FieldInputProps<object>;
          @gear() public readonly meta!: FieldMetaProps<unknown>;
          @gear() public readonly refs!: NodeListOf<HTMLInputElement>;

          @option() public readonly name: string = 'test';
        }

        const tag = defineCE(Field);

        const formElement = await fixture(`
            <${formTag}>
              <${tag}>
                <input type="text">
              </${tag}>
            </${formTag}>
          `);

        const fieldElement = formElement.querySelector<Field>(tag)!;
        const inputElement = formElement.querySelector('input')!;

        expect(fieldElement.refs[0]).toBe(inputElement);
      });

      it('does not throw an error if class already have own lifecycle element', () => {
        expect(() => {
          @field()
          // @ts-ignore
          class Field extends CustomElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly input!: FieldInputProps<string>;
            @gear() public readonly meta!: FieldMetaProps<unknown>;

            @option() public readonly name: string = 'test';

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

      describe('text', () => {
        it('updates form property on input change event', async () => {
          const formElement = await fixture(`
            <${formTag}>
              <${fieldTag}>
                <input type="text"/>
              </${fieldTag}>
            </${formTag}>
          `);

          const inputElement = formElement.querySelector<HTMLInputElement>(
            'input',
          )!;

          inputElement.value = 'test';
          inputElement.dispatchEvent(new Event('input', {bubbles: true}));
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

          const inputElement = formElement.querySelector<HTMLInputElement>(
            'input',
          )!;
          const listener = getListener();

          listener({...state, value: 'a2'});

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

          const inputElement = formElement.querySelector<HTMLInputElement>(
            'input',
          )!;
          const listener = getListener();

          // user changes text to a2
          inputElement.value = 'a2';
          inputElement.dispatchEvent(new Event('input', {bubbles: true}));

          const inputSet = spyOnProperty(inputElement, 'value', 'set');

          // form sends update for a field
          listener({...state, value: 'a2'});

          // expecting field to ignore this update
          expect(inputSet).not.toHaveBeenCalled();
        });

        it('allows HTMLInputElement to update form value', async () => {
          @field({auto: true})
          class Field extends HTMLInputElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly input!: FieldInputProps<object>;
            @gear() public readonly meta!: FieldMetaProps<unknown>;

            @option() public readonly name: string = 'test';
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
          fieldElement.dispatchEvent(new Event('input', {bubbles: true}));

          expect(state.change).toHaveBeenCalledWith('a2');
        });

        it('allows HTMLInputElement updating on form change', async () => {
          @field({auto: true})
          class Field extends HTMLInputElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly input!: FieldInputProps<object>;
            @gear() public readonly meta!: FieldMetaProps<unknown>;

            @option() public readonly name: string = 'test';
          }

          const nativeFieldTag = genName();
          customElements.define(nativeFieldTag, Field, {extends: 'input'});

          const formElement = await fixture(`
            <${formTag}>
              <input is="${nativeFieldTag}" type="text" value="a1">
            </${formTag}>
          `);

          const fieldElement = formElement.querySelector<Field>('input')!;
          const listener = getListener();

          listener({...state, value: 'a2'});

          expect(fieldElement.value).toBe('a2');
        });

        it('will convert undefined and null into an empty string on form update', async () => {
          state.value = 'a1';

          const formElement = await fixture(`
            <${formTag}>
              <${fieldTag}>
                <input type="text" value="a1"/>
              </${fieldTag}>
            </${formTag}>
          `);

          const inputElement = formElement.querySelector<HTMLInputElement>(
            'input',
          )!;
          const listener = getListener();

          listener({...state, value: undefined});

          expect(inputElement.value).toBe('');

          listener({...state, value: null});

          expect(inputElement.value).toBe('');
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

          const inputElement = formElement.querySelector<HTMLInputElement>(
            'input',
          )!;

          inputElement.checked = true;
          inputElement.dispatchEvent(new Event('input', {bubbles: true}));
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

          const inputElement = formElement.querySelector<HTMLInputElement>(
            'input',
          )!;

          inputElement.checked = true;
          inputElement.dispatchEvent(new Event('input', {bubbles: true}));
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

          const inputElement = formElement.querySelector<HTMLInputElement>(
            'input',
          )!;

          inputElement.checked = true;
          inputElement.dispatchEvent(new Event('input', {bubbles: true}));
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

          const inputElement = formElement.querySelector<HTMLInputElement>(
            'input',
          )!;

          inputElement.checked = false;
          inputElement.dispatchEvent(new Event('input', {bubbles: true}));
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

          const inputElement = formElement.querySelector<HTMLInputElement>(
            'input',
          )!;

          inputElement.checked = false;
          inputElement.dispatchEvent(new Event('input', {bubbles: true}));
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

          const inputElement = formElement.querySelector<HTMLInputElement>(
            'input',
          )!;
          const listener = getListener();

          expect(inputElement.checked).not.toBeTruthy();

          listener({...state, value: true});
          expect(inputElement.checked).toBeTruthy();

          listener({...state, value: false});
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

          const inputElementFoo = formElement.querySelector<HTMLInputElement>(
            'input[value=foo]',
          )!;
          const inputElementBar = formElement.querySelector<HTMLInputElement>(
            'input[value=bar]',
          )!;
          const listener = getListener();

          expect(inputElementFoo.checked).not.toBeTruthy();
          expect(inputElementBar.checked).not.toBeTruthy();

          listener({...state, value: ['foo']});
          expect(inputElementFoo.checked).toBeTruthy();
          expect(inputElementBar.checked).not.toBeTruthy();

          listener({...state, value: ['foo', 'bar']});
          expect(inputElementFoo.checked).toBeTruthy();
          expect(inputElementBar.checked).toBeTruthy();

          listener({...state, value: ['bar']});
          expect(inputElementFoo.checked).not.toBeTruthy();
          expect(inputElementBar.checked).toBeTruthy();
        });

        it('allows HTMLInputElement to update form value', async () => {
          @field({auto: true})
          class Field extends HTMLInputElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly input!: FieldInputProps<object>;
            @gear() public readonly meta!: FieldMetaProps<unknown>;

            @option() public readonly name: string = 'test';
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
          fieldElement.dispatchEvent(new Event('input', {bubbles: true}));
          expect(state.change).toHaveBeenCalledWith(true);
        });

        it('allows HTMLInputElement updating on form change', async () => {
          @field({auto: true})
          class Field extends HTMLInputElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly input!: FieldInputProps<object>;
            @gear() public readonly meta!: FieldMetaProps<unknown>;

            @option() public readonly name: string = 'test';
          }

          const nativeFieldTag = genName();
          customElements.define(nativeFieldTag, Field, {extends: 'input'});

          const formElement = await fixture(`
            <${formTag}>
              <input is="${nativeFieldTag}" type="checkbox">
            </${formTag}>
          `);

          const fieldElement = formElement.querySelector<Field>('input')!;
          const listener = getListener();

          expect(fieldElement.checked).not.toBeTruthy();

          listener({...state, value: true});
          expect(fieldElement.checked).toBeTruthy();

          listener({...state, value: false});
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

          const inputElementFoo = formElement.querySelector<HTMLInputElement>(
            'input[value=foo]',
          )!;
          const inputElementBar = formElement.querySelector<HTMLInputElement>(
            'input[value=bar]',
          )!;

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

          const inputElementFoo = formElement.querySelector<HTMLInputElement>(
            'input[value=foo]',
          )!;
          const inputElementBar = formElement.querySelector<HTMLInputElement>(
            'input[value=bar]',
          )!;

          inputElementFoo.checked = true;
          inputElementFoo.dispatchEvent(new Event('input', {bubbles: true}));
          expect(state.change).toHaveBeenCalledWith('foo');

          inputElementBar.checked = true;
          inputElementBar.dispatchEvent(new Event('input', {bubbles: true}));
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

          const inputElementFoo = formElement.querySelector<HTMLInputElement>(
            'input[value=foo]',
          )!;
          const inputElementBar = formElement.querySelector<HTMLInputElement>(
            'input[value=bar]',
          )!;
          const listener = getListener();

          expect(inputElementFoo.checked).not.toBeTruthy();
          expect(inputElementBar.checked).not.toBeTruthy();

          listener({...state, value: 'foo'});
          expect(inputElementFoo.checked).toBeTruthy();
          expect(inputElementBar.checked).not.toBeTruthy();

          listener({...state, value: 'bar'});
          expect(inputElementFoo.checked).not.toBeTruthy();
          expect(inputElementBar.checked).toBeTruthy();
        });

        it('allows HTMLInputElement to update form value', async () => {
          @field({auto: true})
          class Field extends HTMLInputElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly input!: FieldInputProps<object>;
            @gear() public readonly meta!: FieldMetaProps<unknown>;

            @option() public readonly name: string = 'test';
          }

          const nativeFieldTag = genName();
          customElements.define(nativeFieldTag, Field, {extends: 'input'});

          const formElement = await fixture(`
            <${formTag}>
              <input is="${nativeFieldTag}" type="radio" value="foo">
              <input is="${nativeFieldTag}" type="radio" value="bar">
            </${formTag}>
          `);

          const fieldElementFoo = formElement.querySelector<Field>(
            'input[value=foo]',
          )!;
          const fieldElementBar = formElement.querySelector<Field>(
            'input[value=bar]',
          )!;

          fieldElementFoo.checked = true;
          fieldElementFoo.dispatchEvent(new Event('input', {bubbles: true}));
          expect(state.change).toHaveBeenCalledWith('foo');

          fieldElementBar.checked = true;
          fieldElementBar.dispatchEvent(new Event('input', {bubbles: true}));
          expect(state.change).toHaveBeenCalledWith('bar');
        });

        it('allows HTMLInputElement updating on form change', async () => {
          @field({auto: true})
          class Field extends HTMLInputElement {
            @gear() public readonly formApi!: FormApi;
            @gear() public readonly input!: FieldInputProps<object>;
            @gear() public readonly meta!: FieldMetaProps<unknown>;

            @option() public readonly name: string = 'test';
          }

          const nativeFieldTag = genName();
          customElements.define(nativeFieldTag, Field, {extends: 'input'});

          const formElement = await fixture(`
            <${formTag}>
              <input is="${nativeFieldTag}" type="radio" value="foo">
              <input is="${nativeFieldTag}" type="radio" value="bar">
            </${formTag}>
          `);

          const fieldElementFoo = formElement.querySelector<Field>(
            'input[value=foo]',
          )!;
          const fieldElementBar = formElement.querySelector<Field>(
            'input[value=bar]',
          )!;
          const fooListener = getListener(0);
          const barListener = getListener(1);

          expect(fieldElementFoo.checked).not.toBeTruthy();
          expect(fieldElementBar.checked).not.toBeTruthy();

          fooListener({...state, value: 'foo'});
          barListener({...state, value: 'foo'});
          expect(fieldElementFoo.checked).toBeTruthy();
          expect(fieldElementBar.checked).not.toBeTruthy();

          fooListener({...state, value: 'bar'});
          barListener({...state, value: 'bar'});
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
            selectElement.dispatchEvent(new Event('input', {bubbles: true}));

            expect(state.change).toHaveBeenCalledWith('2');
          });

          it('sets the form value to the array of selected option if selection is multiple', () => {
            enableMultiple();

            option1.selected = true;
            option2.selected = true;

            selectElement.dispatchEvent(new Event('input', {bubbles: true}));

            expect(state.change).toHaveBeenCalledWith(['1', '2']);
          });

          it('updates select value on form change if selection is single', () => {
            const listener = getListener();

            expect(option1.selected).not.toBeTruthy();
            expect(option2.selected).not.toBeTruthy();

            listener({...state, value: '1'});
            expect(option1.selected).toBeTruthy();
            expect(option2.selected).not.toBeTruthy();

            listener({...state, value: '2'});
            expect(option1.selected).not.toBeTruthy();
            expect(option2.selected).toBeTruthy();
          });

          it('updates select values on form change if selection is multiple', () => {
            enableMultiple();

            const listener = getListener();

            expect(option1.selected).not.toBeTruthy();
            expect(option2.selected).not.toBeTruthy();

            listener({...state, value: ['1', '2']});
            expect(option1.selected).toBeTruthy();
            expect(option2.selected).toBeTruthy();

            listener({...state, value: ['2']});
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
              @gear() public readonly formApi!: FormApi;
              @gear() public readonly input!: FieldInputProps<object>;
              @gear() public readonly meta!: FieldMetaProps<unknown>;

              @option() public readonly name: string = 'test';
            }

            const nativeFieldTag = genName();
            customElements.define(nativeFieldTag, Field, {extends: 'select'});

            const formElement = await fixture<HTMLSelectElement>(`
              <${formTag}>
                <select is="${nativeFieldTag}">
                  <option value="1">One</option>
                  <option value="2">Two</option>
                </select>
              </${formTag}>
            `);

            selectElement = formElement.querySelector('select')!;
            [option1, option2] = Array.from<HTMLOptionElement>(
              formElement.querySelectorAll('option'),
            );
          });

          it('allows to update form value', () => {
            option2.selected = true;
            selectElement.dispatchEvent(new Event('input', {bubbles: true}));

            expect(state.change).toHaveBeenCalledWith('2');
          });

          it('allows to update select value on form change', () => {
            const listener = getListener();

            expect(option1.selected).not.toBeTruthy();
            expect(option2.selected).not.toBeTruthy();

            listener({...state, value: '1'});
            expect(option1.selected).toBeTruthy();
            expect(option2.selected).not.toBeTruthy();

            listener({...state, value: '2'});
            expect(option1.selected).not.toBeTruthy();
            expect(option2.selected).toBeTruthy();
          });
        });
      });
    });
  });
});
