// tslint:disable:no-unused-expression no-empty
import {FormApi, FormState} from 'final-form';
import {createForm, formSpyObject, unsubscribe} from '../../../test/mocks/finalForm';
import {CustomElement, genName} from '../../../test/utils';
import {createFormContext, FormDecorator} from '../src';
import {all} from '../src/utils';

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
      formSpyObject.setConfig.calls.reset();
      formSpyObject.submit.calls.reset();
      formSpyObject.subscribe.calls.reset();
    });

    it('allows to declare form configuration with decorator', () => {
      @form()
      class Test {
        @api public readonly form!: FormApi;
        @api public readonly state!: FormState;

        @option
        public debug: boolean = true;

        @option
        public onSubmit(): void {}
      }

      new Test();
      expect(createForm).toHaveBeenCalledWith({
        debug: true,
        onSubmit: jasmine.any(Function),
      });
    });

    it('allows to declare configuration with method and makes it bound', () => {
      const submitSpy = jasmine.createSpy('OnSubmit');

      @form()
      class Test {
        @api public readonly form!: FormApi;
        @api public readonly state!: FormState;

        public call(): void {
          submitSpy();
        }

        @option
        public onSubmit(): void {
          this.call();
        }
      }

      new Test();
      expect(createForm).toHaveBeenCalledWith({
        onSubmit: jasmine.any(Function),
      });

      const [{onSubmit}] = createForm.calls.mostRecent().args;

      onSubmit();
      expect(submitSpy).toHaveBeenCalled();
    });

    it('allows to declare configuration on full accessor', () => {
      @form()
      class Test {
        @api public readonly form!: FormApi;
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

      new Test();
      expect(createForm).toHaveBeenCalledWith({
        debug: true,
        onSubmit: jasmine.any(Function),
      });
    });

    it('allows to update form data with defined properties', () => {
      @form()
      class Test {
        @api public readonly form!: FormApi;
        @api public readonly state!: FormState;

        @option
        public debug: boolean = true;

        @option
        public onSubmit(): void {}
      }

      const test = new Test();
      test.debug = false;

      expect(formSpyObject.setConfig).toHaveBeenCalledWith('debug', false);
    });

    it('does not update property if it is the same', () => {
      @form()
      class Test {
        @api public readonly form!: FormApi;
        @api public readonly state!: FormState;

        @option
        public debug: boolean = true;

        @option
        public onSubmit(): void {}
      }

      const test = new Test();
      test.debug = true;

      expect(formSpyObject.setConfig).not.toHaveBeenCalled();
    });

    it('throws an error if key is not one of the config options', () => {
      expect(() => {
        @form()
        // @ts-ignore
        class Test {
          @api public readonly form!: FormApi;
          @api public readonly state!: FormState;

          @option
          public test: boolean = true;

          @option
          public onSubmit(): void {}
        }
      }).toThrow(new TypeError('"test" is not one of the Final Form or Field configuration keys'));
    });

    it('initializes form if new "initialValues" are set', () => {
      @form()
      class Test {
        @api public readonly form!: FormApi;
        @api public readonly state!: FormState;

        @option
        public initialValues: object = {
          bar: 2,
          foo: 1,
        };

        @option
        public onSubmit(): void {}
      }

      const test = new Test();

      test.initialValues = {
        bar: 3,
        foo: 3,
      };

      expect(formSpyObject.initialize).toHaveBeenCalledWith({
        bar: 3,
        foo: 3,
      });
    });

    it('checks shallow equality by default for initialValues', () => {
      @form()
      class Test {
        @api public readonly form!: FormApi;
        @api public readonly state!: FormState;

        @option
        public initialValues: object = {
          bar: 2,
          foo: 1,
        };

        @option
        public onSubmit(): void {}
      }

      const test = new Test();

      test.initialValues = {
        bar: 2,
        foo: 1,
      };

      expect(formSpyObject.initialize).not.toHaveBeenCalled();
    });

    it('uses @option compareInitialValues to check initial values equality if set', () => {
      const compareInitialValuesSpy = jasmine.createSpy('compareInitialValues');

      @form()
      class Test {
        @api public readonly form!: FormApi;
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

      const test = new Test();

      test.initialValues = {
        bar: 2,
        foo: 3,
      };

      expect(formSpyObject.initialize).toHaveBeenCalledWith({
        bar: 2,
        foo: 3,
      });

      expect(compareInitialValuesSpy).toHaveBeenCalled();
    });

    it('sets default undefined if option exists but not set', () => {
      @form()
      class Test {
        @api public readonly form!: FormApi;
        @api public readonly state!: FormState;

        @option
        public debug?: boolean;

        @option
        public onSubmit(): void {}
      }

      new Test();
      expect(createForm).toHaveBeenCalledWith({
        debug: undefined,
        onSubmit: jasmine.any(Function),
      });
    });

    it('decorates form on connection and unsubscribes decorators on disconnection', () => {
      const decorate = jasmine.createSpy('decorate');
      decorate.and.returnValue(unsubscribe);

      @form({
        decorators: [decorate],
      })
      class Test extends CustomElement {
        @api public readonly form!: FormApi;
        @api public readonly state!: FormState;

        @option
        public onSubmit(): void {}
      }

      customElements.define(genName(), Test);

      const test = new Test();

      test.connectedCallback();
      expect(decorate).toHaveBeenCalledWith(formSpyObject);

      test.disconnectedCallback();
      expect(unsubscribe).toHaveBeenCalledTimes(2);
    });

    it('subscribes to the form on connection, unsubscribes on disconnection and sets form state', () => {
      @form()
      class Test extends CustomElement {
        @api public readonly form!: FormApi;
        @api public readonly state!: FormState;

        @option
        public onSubmit(): void {}
      }

      customElements.define(genName(), Test);

      const test = new Test();

      test.connectedCallback();
      expect(formSpyObject.subscribe).toHaveBeenCalledWith(jasmine.any(Function), all);

      const state = {};

      const [fn] = formSpyObject.subscribe.calls.mostRecent().args;
      fn(state);

      expect(test.state).toBe(state as FormState);

      test.disconnectedCallback();
      expect(unsubscribe).toHaveBeenCalled();
    });

    it('sets submit callback on form submit listener on connection and removes it on disconnection', () => {
      @form()
      class Test extends CustomElement {
        @api public readonly form!: FormApi;
        @api public readonly state!: FormState;

        @option
        public onSubmit(): void {}
      }

      customElements.define(genName(), Test);

      const test = new Test();
      const addEventListener = spyOn(test, 'addEventListener');
      const removeEventListener = spyOn(test, 'removeEventListener');

      test.connectedCallback();
      expect(addEventListener).toHaveBeenCalledWith('submit', jasmine.any(Function));

      const submitEvent = jasmine.createSpyObj('submitEvent', [
        'preventDefault',
        'stopPropagation',
      ]);

      const [, fn] = addEventListener.calls.first().args;
      fn(submitEvent);

      expect(submitEvent.preventDefault).toHaveBeenCalled();
      expect(submitEvent.stopPropagation).toHaveBeenCalled();
      expect(formSpyObject.submit).toHaveBeenCalled();

      test.disconnectedCallback();
      expect(removeEventListener).toHaveBeenCalledWith('submit', fn);
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
            @api public readonly form!: FormApi;
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
            @api public readonly form!: FormApi;
            @api public readonly state!: FormState;
          }
        }).toThrowError('@form requires onSubmit property marked with @option');
      });
    });
  });
};

export default testForm;
