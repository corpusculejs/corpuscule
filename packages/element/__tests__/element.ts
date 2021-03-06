// tslint:disable:no-unbound-method
import {fixture, fixtureSync} from '@open-wc/testing-helpers';
import {Constructor, createTestingPromise, CustomElement, genName} from '../../../test/utils';
import {
  element as basicElement,
  ElementDecoratorOptions,
  internalChangedCallback,
  propertyChangedCallback,
  render,
  updatedCallback,
} from '../src';

const fixtureMixin = <T extends Constructor<Element>>(base: T) =>
  class extends base {
    public updateComplete: Promise<void>; // tslint:disable-line:prefer-readonly
    private resolve: () => void; // tslint:disable-line:prefer-readonly

    public constructor(...args: any[]) {
      super(...args);
      [this.updateComplete, this.resolve] = createTestingPromise();
    }

    public connectedCallback(): void {
      this.resolve();
      [this.updateComplete, this.resolve] = createTestingPromise();
    }

    public [updatedCallback](): void {
      this.resolve();
      [this.updateComplete, this.resolve] = createTestingPromise();
    }
  };

type SimplifiedElementDecorator = (
  name: string,
  options?: Omit<ElementDecoratorOptions, 'renderer' | 'scheduler'>,
) => ClassDecorator;

describe('@corpuscule/element', () => {
  describe('@element', () => {
    let define: jasmine.Spy;
    let element: SimplifiedElementDecorator;
    let rendererSpy: jasmine.Spy;
    let schedulerSpy: jasmine.Spy;

    beforeEach(() => {
      rendererSpy = jasmine.createSpy('onTemplateRender');
      schedulerSpy = jasmine.createSpy('onSchedule');

      schedulerSpy.and.callFake((renderCallback: () => void) => renderCallback());

      define = spyOn(customElements, 'define');
      define.and.callThrough();

      element = (name, options) =>
        basicElement(name, {...options, renderer: rendererSpy, scheduler: schedulerSpy});
    });

    it('adds element to a custom elements registry', async () => {
      const name = genName();

      @element(name)
      class Test extends fixtureMixin(CustomElement) {
        protected [render](): null {
          return null;
        }
      }

      await customElements.whenDefined(name);

      expect(define).toHaveBeenCalledWith(name, Test, undefined);
    });

    it('adds "is" readonly field with name to element', () => {
      const name = genName();

      @element(name)
      class Test extends fixtureMixin(CustomElement) {
        public static readonly is: string;

        protected [render](): null {
          return null;
        }
      }

      expect(Test.is).toBe(name);
    });

    it('defines invalidate function only if [render] is present', async () => {
      const tag = genName();

      @element(tag)
      // @ts-ignore
      class Test extends fixtureMixin(CustomElement) {}

      await fixture(`<${tag}></${tag}>`);

      expect(schedulerSpy).not.toHaveBeenCalled();
    });

    it('renders on element connection', async () => {
      const connectedCallbackSpy = jasmine.createSpy('onConnect');

      const tag = genName();

      @element(tag)
      // @ts-ignore
      class Test extends fixtureMixin(CustomElement) {
        public connectedCallback(): void {
          super.connectedCallback();
          connectedCallbackSpy();
        }

        protected [render](): null {
          return null;
        }
      }

      await fixture(`<${tag}></${tag}>`);

      expect(connectedCallbackSpy).toHaveBeenCalled();
      expect(schedulerSpy).toHaveBeenCalled();
    });

    it('re-renders on each attribute change', async () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');

      const tag = genName();

      @element(tag)
      class Test extends fixtureMixin(CustomElement) {
        public attributeChangedCallback(...args: unknown[]): void {
          attributeChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = await fixture<Test>(`<${tag}></${tag}>`);

      test.attributeChangedCallback('test', 'old', 'new');
      expect(attributeChangedCallbackSpy).toHaveBeenCalledWith('test', 'old', 'new');
      expect(schedulerSpy).toHaveBeenCalledTimes(2);
    });

    it('re-renders on each [propertyChangedCallback]', async () => {
      const propertyChangedCallbackSpy = jasmine.createSpy('onPropertyChange');

      const tag = genName();

      @element(tag)
      class Test extends fixtureMixin(CustomElement) {
        public [propertyChangedCallback](...args: unknown[]): void {
          propertyChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = await fixture<Test>(`<${tag}></${tag}>`);

      test[propertyChangedCallback]('test', 'old', 'new');
      expect(propertyChangedCallbackSpy).toHaveBeenCalledWith('test', 'old', 'new');
      expect(schedulerSpy).toHaveBeenCalledTimes(2);
    });

    it('re-renders on each [internalChangedCallback]', async () => {
      const internalChangedCallbackSpy = jasmine.createSpy('onInternalChange');

      const tag = genName();

      @element(tag)
      class Test extends fixtureMixin(CustomElement) {
        public [internalChangedCallback](...args: unknown[]): void {
          internalChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = await fixture<Test>(`<${tag}></${tag}>`);

      test[internalChangedCallback]('test', 'old', 'new');
      expect(internalChangedCallbackSpy).toHaveBeenCalledWith('test', 'old', 'new');
      expect(schedulerSpy).toHaveBeenCalledTimes(2);
    });

    it('calls [updatedCallback] on each re-render', async () => {
      const updatedCallbackSpy = jasmine.createSpy('onUpdate');

      const tag = genName();

      @element(tag)
      class Test extends fixtureMixin(CustomElement) {
        public [updatedCallback](): void {
          super[updatedCallback]();
          updatedCallbackSpy();
        }

        public [render](): null {
          return null;
        }
      }

      const test = await fixture<Test>(`<${tag}></${tag}>`);

      // This commands causes update
      test.attributeChangedCallback('test', '1', '2');

      await test.updateComplete;

      expect(updatedCallbackSpy).toHaveBeenCalledTimes(1);
    });

    it('sends to the renderer function result of [render]', async () => {
      const tag = genName();

      @element(tag)
      class Test extends fixtureMixin(CustomElement) {
        public [render](): string {
          return 'rendered string';
        }
      }

      const test = await fixture<Test>(`<${tag}></${tag}>`);

      expect(rendererSpy).toHaveBeenCalledWith('rendered string', jasmine.any(Node), test);
    });

    it('does not allow to run re-render if old and new values are identical (except for internal)', async () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');
      const propertyChangedCallbackSpy = jasmine.createSpy('onPropertyChange');
      const internalChangedCallbackSpy = jasmine.createSpy('onInternalChange');

      const tag = genName();

      @element(tag)
      class Test extends fixtureMixin(CustomElement) {
        public attributeChangedCallback(...args: unknown[]): void {
          attributeChangedCallbackSpy(...args);
        }

        public [propertyChangedCallback](...args: unknown[]): void {
          propertyChangedCallbackSpy(...args);
        }

        public [internalChangedCallback](...args: unknown[]): void {
          internalChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = await fixture<Test>(`<${tag}></${tag}>`);

      schedulerSpy.calls.reset();

      test.attributeChangedCallback('attr', 'same', 'same');
      test[propertyChangedCallback]('prop', 'same', 'same');
      test[internalChangedCallback]('internal', 'same', 'same');

      expect(attributeChangedCallbackSpy).not.toHaveBeenCalled();
      expect(propertyChangedCallbackSpy).not.toHaveBeenCalled();

      expect(internalChangedCallbackSpy).toHaveBeenCalled();
      expect(schedulerSpy).toHaveBeenCalledTimes(1);
    });

    it('does not allow to use [updatedCallback] and changed callbacks when not connected', async () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');
      const propertyChangedCallbackSpy = jasmine.createSpy('onPropertyChange');
      const internalChangedCallbackSpy = jasmine.createSpy('onInternalChange');

      const tag = genName();

      @element(tag)
      class Test extends fixtureMixin(CustomElement) {
        public attributeChangedCallback(...args: unknown[]): void {
          attributeChangedCallbackSpy(...args);
        }

        public [propertyChangedCallback](...args: unknown[]): void {
          propertyChangedCallbackSpy(...args);
        }

        public [internalChangedCallback](...args: unknown[]): void {
          internalChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      await customElements.whenDefined(tag);

      const test = fixtureSync<Test>(`<${tag}></${tag}>`);

      test.attributeChangedCallback('attr', 'old', 'new');
      test[propertyChangedCallback]('attr', 'old', 'new');
      test[internalChangedCallback]('attr', 'old', 'new');

      await test.updateComplete;

      expect(attributeChangedCallbackSpy).not.toHaveBeenCalled();
      expect(propertyChangedCallbackSpy).not.toHaveBeenCalled();
      expect(internalChangedCallbackSpy).not.toHaveBeenCalled();
      // only during the connection
      expect(schedulerSpy).toHaveBeenCalledTimes(1);
    });

    it('makes only one render on multiple property change', async () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');

      const tag = genName();

      @element(tag)
      class Test extends fixtureMixin(CustomElement) {
        public attributeChangedCallback(...args: unknown[]): void {
          attributeChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = await fixture<Test>(`<${tag}></${tag}>`);
      schedulerSpy.calls.reset();
      schedulerSpy.and.stub();

      test.attributeChangedCallback('attr', 'old', 'new');
      test.attributeChangedCallback('attr', 'old', 'new');

      const [renderCallback] = schedulerSpy.calls.mostRecent().args;
      renderCallback();

      expect(attributeChangedCallbackSpy).toHaveBeenCalledTimes(2);
      expect(schedulerSpy).toHaveBeenCalledTimes(1);
    });

    it('allows to use light DOM', async () => {
      const tag = genName();

      @element(tag, {lightDOM: true})
      // @ts-ignore
      class Test extends fixtureMixin(CustomElement) {
        public [render](): string {
          return 'render';
        }
      }

      const test = await fixture<Test>(`<${tag}></${tag}>`);

      expect(rendererSpy).toHaveBeenCalledWith('render', test, jasmine.any(Object));
    });

    it('does not throw an error if class already have own lifecycle element', () => {
      expect(() => {
        @element(genName())
        // @ts-ignore
        class Test extends fixtureMixin(CustomElement) {
          public constructor() {
            super();
            this.connectedCallback = this.connectedCallback.bind(this);
            this.attributeChangedCallback = this.attributeChangedCallback.bind(this);
          }

          public connectedCallback(): void {}

          public attributeChangedCallback(): void {}

          public [render](): string {
            return 'render';
          }
        }
      }).not.toThrow();
    });

    it('allows omitting renderer option', async () => {
      const tag = genName();

      @basicElement(tag, {scheduler: schedulerSpy})
      // @ts-ignore
      class Test extends fixtureMixin(CustomElement) {
        public [render](): string {
          return 'render';
        }
      }

      await fixture(`<${tag}></${tag}>`);

      expect(schedulerSpy).not.toHaveBeenCalled();
    });

    describe('elements extending', () => {
      it('allows extending existing element', async () => {
        const tag1 = genName();
        const tag2 = genName();

        @element(tag1)
        class Parent extends fixtureMixin(CustomElement) {
          public [render](): null {
            return null;
          }
        }

        @element(tag2)
        // @ts-ignore
        class Child extends Parent {
          public [render](): null {
            return null;
          }
        }

        await Promise.all([customElements.whenDefined(tag1), customElements.whenDefined(tag2)]);

        expect(customElements.define).toHaveBeenCalledTimes(2);
      });

      it('calls only child render function if child inherits parent class', async () => {
        const connectedSpyParent = jasmine.createSpy('connectedCallbackParent');
        const connectedSpyChild = jasmine.createSpy('connectedCallbackChild');

        @element(genName())
        class Parent extends fixtureMixin(CustomElement) {
          public connectedCallback(): void {
            super.connectedCallback();
            connectedSpyParent();
          }

          public [render](): null {
            return null;
          }
        }

        const tag = genName();

        @element(tag)
        // @ts-ignore
        class Child extends Parent {
          public connectedCallback(): void {
            super.connectedCallback();
            connectedSpyChild();
          }

          public [render](): null {
            return null;
          }
        }

        await fixture(`<${tag}></${tag}>`);

        expect(schedulerSpy).toHaveBeenCalledTimes(1);
        expect(connectedSpyChild).toHaveBeenCalled();
        expect(connectedSpyParent).toHaveBeenCalled();
      });
    });

    describe('customized built-in elements', () => {
      it('allows to create', async () => {
        const name = genName();

        @element(name, {extends: 'a'})
        class Test extends fixtureMixin(HTMLAnchorElement) {}

        await customElements.whenDefined(name);

        expect(customElements.define).toHaveBeenCalledWith(name, Test, {extends: 'a'});
      });

      it('does not re-render', async () => {
        const tag = genName();

        @element(tag, {extends: 'a'})
        // @ts-ignore
        class Test extends fixtureMixin(HTMLAnchorElement) {}

        await fixture(`<a is="${tag}"></a>`);

        expect(schedulerSpy).not.toHaveBeenCalled();
      });

      it('creates ShadowRoot for allowed elements', async () => {
        const tag = genName();

        @element(tag, {extends: 'span'})
        class Test extends fixtureMixin(HTMLSpanElement) {}

        const test = await fixture<Test>(`<span is="${tag}"></span>`);

        expect(test.shadowRoot).not.toBeUndefined();
      });

      it('creates LightDOM for other elements', async () => {
        const tag = genName();

        @element(tag, {extends: 'a'})
        class Test extends fixtureMixin(HTMLAnchorElement) {}

        const test = await fixture<Test>(`<a is="${tag}"></a>`);

        expect(test.shadowRoot).toBeNull();
      });

      it('defines that element is connected for light DOM elements', async () => {
        const attributeChangedCallbackSpy = jasmine.createSpy('attributeChangedCallback');
        const tag = genName();

        @element(tag, {extends: 'a'})
        class Test extends fixtureMixin(HTMLAnchorElement) {
          public attributeChangedCallback(...args: any[]): void {
            attributeChangedCallbackSpy(...args);
          }
        }

        const test = await fixture<Test>(`<a is="${tag}"></a>`);

        test.attributeChangedCallback('test', '1', '2');

        // This test allows to understand was the user-defined attributeChangedCallback
        // was called by the system one.
        expect(attributeChangedCallbackSpy).toHaveBeenCalledWith('test', '1', '2');
      });
    });
  });
});
