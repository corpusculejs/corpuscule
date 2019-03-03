// tslint:disable:no-unbound-method
import {defineCE, fixture, html, unsafeStatic} from '@open-wc/testing-helpers';
import {FormApi, FormState} from 'final-form';
import {createForm, formSpyObject, unsubscribe} from '../../../test/mocks/finalForm';
import {CustomElement} from '../../../test/utils';
import {createFormContext, FormDecorator} from '../src';
import {all} from '../src/form';

const testForm = () => {
  describe('@form', () => {
    let api: PropertyDecorator;
    let form: FormDecorator;
    let option: PropertyDecorator;

    beforeEach(() => {
      ({api, form, option} = createFormContext());

      createForm.calls.reset();
      unsubscribe.calls.reset();

      formSpyObject.get.calls.reset();
      formSpyObject.initialize.calls.reset();
      formSpyObject.reset.calls.reset();
      formSpyObject.setConfig.calls.reset();
      formSpyObject.submit.calls.reset();
      formSpyObject.subscribe.calls.reset();
    });

    it('allows to declare form configuration with decorator', async () => {
      @form()
      class Test extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public debug: boolean = true;

        @option
        public onSubmit(): void {}
      }

      const tag = defineCE(Test);
      await fixture(`<${tag}></${tag}>`);

      expect(createForm).toHaveBeenCalledWith({
        debug: true,
        onSubmit: jasmine.any(Function),
      });
    });

    it('allows to declare configuration with method and makes it bound', async () => {
      const submitSpy = jasmine.createSpy('OnSubmit');

      @form()
      class Test extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        public call(): void {
          submitSpy();
        }

        @option
        public onSubmit(): void {
          this.call();
        }
      }

      const tag = defineCE(Test);
      await fixture(`<${tag}></${tag}>`);

      expect(createForm).toHaveBeenCalledWith({
        onSubmit: jasmine.any(Function),
      });

      const [{onSubmit}] = createForm.calls.mostRecent().args;

      onSubmit();
      expect(submitSpy).toHaveBeenCalled();
    });

    it('allows to declare configuration on full accessor', async () => {
      @form()
      class Test extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        public secret: boolean = true;

        @option
        public get debug(): boolean {
          return this.secret;
        }

        public set debug(v: boolean) {
          this.secret = v;
        }

        @option
        public onSubmit(): void {}
      }

      const tag = defineCE(Test);
      await fixture(`<${tag}></${tag}>`);

      expect(createForm).toHaveBeenCalledWith({
        debug: true,
        onSubmit: jasmine.any(Function),
      });
    });

    it('allows to update form data with defined properties', async () => {
      @form()
      class Test extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public debug: boolean = true;

        @option
        public onSubmit(): void {}
      }

      const tag = defineCE(Test);
      const test = (await fixture(`<${tag}></${tag}>`)) as Test;

      test.debug = false;

      expect(formSpyObject.setConfig).toHaveBeenCalledWith('debug', false);
    });

    it('does not update property if it is the same', async () => {
      @form()
      class Test extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public debug: boolean = true;

        @option
        public onSubmit(): void {}
      }

      const tag = defineCE(Test);
      const test = (await fixture(`<${tag}></${tag}>`)) as Test;

      test.debug = true;

      expect(formSpyObject.setConfig).not.toHaveBeenCalled();
    });

    it('throws an error if key is not one of the config options', () => {
      expect(() => {
        @form()
        // @ts-ignore
        class Test extends CustomElement {
          @api public readonly formApi!: FormApi;
          @api public readonly state!: FormState;

          @option
          public test: boolean = true;

          @option
          public onSubmit(): void {}
        }
      }).toThrow(new TypeError('"test" is not one of the Final Form or Field configuration keys'));
    });

    it('initializes form if new "initialValues" are set', async () => {
      @form()
      class Test extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public initialValues: object = {
          bar: 2,
          foo: 1,
        };

        @option
        public onSubmit(): void {}
      }

      const tag = unsafeStatic(defineCE(Test));
      await fixture(
        html`<${tag} .initialValues="${{
          bar: 3,
          foo: 3,
        }}"></${tag}>`,
      );

      expect(formSpyObject.initialize).toHaveBeenCalledWith({
        bar: 3,
        foo: 3,
      });
    });

    it('checks shallow equality by default for initialValues', async () => {
      @form()
      class Test extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public initialValues: object = {
          bar: 2,
          foo: 1,
        };

        @option
        public onSubmit(): void {}
      }

      const tag = unsafeStatic(defineCE(Test));
      await fixture(
        html`<${tag} .initialValues="${{
          bar: 2,
          foo: 1,
        }}"></${tag}>`,
      );

      expect(formSpyObject.initialize).not.toHaveBeenCalled();
    });

    it('uses @option compareInitialValues to check initial values equality if set', async () => {
      const compareInitialValuesSpy = jasmine.createSpy('compareInitialValues');

      @form()
      class Test extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public initialValues: object = {
          bar: 2,
          foo: 1,
        };

        @option
        public compareInitialValues<T extends {foo: number}>(a: T, b: T): boolean {
          compareInitialValuesSpy();

          return a.foo === b.foo;
        }

        @option
        public onSubmit(): void {}
      }

      const tag = unsafeStatic(defineCE(Test));

      await fixture(
        html`<${tag} .initialValues="${{
          bar: 2,
          foo: 3,
        }}"></${tag}>`,
      );

      expect(formSpyObject.initialize).toHaveBeenCalledWith({
        bar: 2,
        foo: 3,
      });

      expect(compareInitialValuesSpy).toHaveBeenCalled();
    });

    it('sets default undefined if option exists but not set', async () => {
      @form()
      class Test extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public debug?: boolean;

        @option
        public onSubmit(): void {}
      }

      const tag = defineCE(Test);
      await fixture(`<${tag}></${tag}>`);

      expect(createForm).toHaveBeenCalledWith({
        debug: undefined,
        onSubmit: jasmine.any(Function),
      });
    });

    it('decorates form on connection and unsubscribes decorators on disconnection', async () => {
      const decorate = jasmine.createSpy('decorate');
      decorate.and.returnValue(unsubscribe);

      @form({
        decorators: [decorate],
      })
      class Test extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public onSubmit(): void {}
      }

      const tag = defineCE(Test);
      const test = await fixture(`<${tag}></${tag}>`);

      expect(decorate).toHaveBeenCalledWith(formSpyObject);

      test.remove();
      expect(unsubscribe).toHaveBeenCalledTimes(2);
    });

    it('subscribes to the form on connection, unsubscribes on disconnection and sets form state', async () => {
      @form()
      class Test extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public onSubmit(): void {}
      }

      const tag = defineCE(Test);
      const test = (await fixture(`<${tag}></${tag}>`)) as Test;

      expect(formSpyObject.subscribe).toHaveBeenCalledWith(jasmine.any(Function), all);

      const state = {};

      const [fn] = formSpyObject.subscribe.calls.mostRecent().args;
      fn(state);

      expect(test.state).toBe(state as FormState);

      test.remove();
      expect(unsubscribe).toHaveBeenCalled();
    });

    it('catches submit event', async () => {
      @form()
      class Test extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public onSubmit(): void {}
      }

      const tag = defineCE(Test);
      const test = (await fixture(`<${tag}></${tag}>`)) as Test;

      const submitEvent = new Event('submit');
      spyOn(submitEvent, 'preventDefault').and.callThrough();
      spyOn(submitEvent, 'stopPropagation').and.callThrough();

      test.dispatchEvent(submitEvent);

      expect(submitEvent.preventDefault).toHaveBeenCalled();
      expect(submitEvent.stopPropagation).toHaveBeenCalled();
      expect(formSpyObject.submit).toHaveBeenCalled();
    });

    it('catches reset event', async () => {
      @form()
      class Test extends CustomElement {
        @api public readonly formApi!: FormApi;
        @api public readonly state!: FormState;

        @option
        public onSubmit(): void {}
      }

      const tag = defineCE(Test);
      const test = (await fixture(`<${tag}></${tag}>`)) as Test;

      const resetEvent = new Event('reset');
      spyOn(resetEvent, 'preventDefault').and.callThrough();
      spyOn(resetEvent, 'stopPropagation').and.callThrough();

      test.dispatchEvent(resetEvent);

      expect(resetEvent.preventDefault).toHaveBeenCalled();
      expect(resetEvent.stopPropagation).toHaveBeenCalled();
      expect(formSpyObject.reset).toHaveBeenCalled();
    });

    describe('@api', () => {
      it('requires form and state fields defined', () => {
        expect(() => {
          @form()
          // @ts-ignore
          class FormField extends CustomElement {}
        }).toThrowError('@form requires form property marked with @api');

        expect(() => {
          @form()
          // @ts-ignore
          class FormField extends CustomElement {
            @api public readonly formApi!: FormApi;
          }
        }).toThrowError('@form requires state property marked with @api');
      });
    });

    describe('@option', () => {
      it('requires onSubmit method defined', () => {
        expect(() => {
          @form()
          // @ts-ignore
          class FormField extends CustomElement {
            @api public readonly formApi!: FormApi;
            @api public readonly state!: FormState;
          }
        }).toThrowError('@form requires onSubmit property marked with @option');
      });
    });

    it('does not throw an error if class already have own lifecycle element', () => {
      expect(() => {
        @form()
        // @ts-ignore
        class Test extends CustomElement {
          @api public readonly formApi!: FormApi;
          @api public readonly state!: FormState;

          public constructor() {
            super();
            this.connectedCallback = this.connectedCallback.bind(this);
            this.disconnectedCallback = this.disconnectedCallback.bind(this);
          }

          public connectedCallback(): void {}

          public disconnectedCallback(): void {}

          @option
          public onSubmit(): void {}
        }
      }).not.toThrow();
    });
  });
};

export default testForm;
