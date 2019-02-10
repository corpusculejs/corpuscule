// tslint:disable:no-unbound-method
import {fixtureSync} from '@open-wc/testing-helpers';
import {Constructor, createTestingPromise, CustomElement, genName} from '../../../test/utils';
import {
  createElementDecorator,
  ElementDecorator,
  internalChangedCallback,
  propertyChangedCallback,
  render,
  updatedCallback,
} from '../src';

const fixtureMixin = <T extends Constructor<{}>>(base: T) =>
  class extends base {
    public updateComplete: Promise<void>; // tslint:disable-line:readonly-keyword
    private resolve: () => void; // tslint:disable-line:readonly-keyword

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

const testElementDecorator = () => {
  describe('@element', () => {
    let define: jasmine.Spy;
    let element: ElementDecorator;
    let rendererSpy: jasmine.Spy;
    let schedulerSpy: jasmine.Spy;

    beforeEach(() => {
      rendererSpy = jasmine.createSpy('onTemplateRender');
      schedulerSpy = jasmine.createSpy('onSchedule');

      schedulerSpy.and.callFake(renderCallback => renderCallback());

      define = spyOn(customElements, 'define');
      define.and.callThrough();

      element = createElementDecorator({renderer: rendererSpy, scheduler: schedulerSpy});
    });

    it('adds element to a custom elements registry', () => {
      const name = genName();

      @element(name)
      class Test extends fixtureMixin(CustomElement) {
        protected [render](): null {
          return null;
        }
      }

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

      const test = fixtureSync(`<${tag}></${tag}>`) as Test;
      await test.updateComplete;

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

      const test = fixtureSync(`<${tag}></${tag}>`) as Test;
      await test.updateComplete;

      expect(connectedCallbackSpy).toHaveBeenCalled();
      expect(schedulerSpy).toHaveBeenCalled();
    });

    it('re-renders on each attribute change', async () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');

      const tag = genName();

      @element(tag)
      class Test extends fixtureMixin(CustomElement) {
        public attributeChangedCallback(...args: Array<unknown>): void {
          attributeChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = fixtureSync(`<${tag}></${tag}>`) as Test;
      await test.updateComplete;

      test.attributeChangedCallback('test', 'old', 'new');
      expect(attributeChangedCallbackSpy).toHaveBeenCalledWith('test', 'old', 'new');
      expect(schedulerSpy).toHaveBeenCalledTimes(2);
    });

    it('re-renders on each [propertyChangedCallback]', async () => {
      const propertyChangedCallbackSpy = jasmine.createSpy('onPropertyChange');

      const tag = genName();

      @element(tag)
      class Test extends fixtureMixin(CustomElement) {
        public [propertyChangedCallback](...args: Array<unknown>): void {
          propertyChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = fixtureSync(`<${tag}></${tag}>`) as Test;
      await test.updateComplete;

      test[propertyChangedCallback]('test', 'old', 'new');
      expect(propertyChangedCallbackSpy).toHaveBeenCalledWith('test', 'old', 'new');
      expect(schedulerSpy).toHaveBeenCalledTimes(2);
    });

    it('re-renders on each [internalChangedCallback]', async () => {
      const internalChangedCallbackSpy = jasmine.createSpy('onInternalChange');

      const tag = genName();

      @element(tag)
      class Test extends fixtureMixin(CustomElement) {
        public [internalChangedCallback](...args: Array<unknown>): void {
          internalChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = fixtureSync(`<${tag}></${tag}>`) as Test;
      await test.updateComplete;

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

      const test = fixtureSync(`<${tag}></${tag}>`) as Test;
      await test.updateComplete;

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

      const test = fixtureSync(`<${tag}></${tag}>`) as Test;
      await test.updateComplete;

      expect(rendererSpy).toHaveBeenCalledWith('rendered string', jasmine.any(Node), test);
    });

    it('does not allow to run re-render if old and new values are identical (except for internal)', async () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');
      const propertyChangedCallbackSpy = jasmine.createSpy('onPropertyChange');
      const internalChangedCallbackSpy = jasmine.createSpy('onInternalChange');

      const tag = genName();

      @element(tag)
      class Test extends fixtureMixin(CustomElement) {
        public attributeChangedCallback(...args: Array<unknown>): void {
          attributeChangedCallbackSpy(...args);
        }

        public [propertyChangedCallback](...args: Array<unknown>): void {
          propertyChangedCallbackSpy(...args);
        }

        public [internalChangedCallback](...args: Array<unknown>): void {
          internalChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = fixtureSync(`<${tag}></${tag}>`) as Test;
      await test.updateComplete;

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
        public attributeChangedCallback(...args: Array<unknown>): void {
          attributeChangedCallbackSpy(...args);
        }

        public [propertyChangedCallback](...args: Array<unknown>): void {
          propertyChangedCallbackSpy(...args);
        }

        public [internalChangedCallback](...args: Array<unknown>): void {
          internalChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = fixtureSync(`<${tag}></${tag}>`) as Test;

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
        public attributeChangedCallback(...args: Array<unknown>): void {
          attributeChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = fixtureSync(`<${tag}></${tag}>`) as Test;
      await test.updateComplete;
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

      const test = fixtureSync(`<${tag}></${tag}>`) as Test;
      await test.updateComplete;

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

    describe('elements extending', () => {
      it('allows extending existing element', () => {
        @element(genName())
        class Parent extends fixtureMixin(CustomElement) {
          public [render](): null {
            return null;
          }
        }

        @element(genName())
        // @ts-ignore
        class Child extends Parent {
          public [render](): null {
            return null;
          }
        }

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

        const test = fixtureSync(`<${tag}></${tag}>`) as Child;
        await test.updateComplete;

        expect(schedulerSpy).toHaveBeenCalledTimes(1);
        expect(connectedSpyChild).toHaveBeenCalled();
        expect(connectedSpyParent).toHaveBeenCalled();
      });
    });

    describe('customized built-in elements', () => {
      it('allows to create', () => {
        const name = genName();

        @element(name, {extends: 'a'})
        class Test extends fixtureMixin(HTMLAnchorElement) {}

        expect(customElements.define).toHaveBeenCalledWith(name, Test, {extends: 'a'});
      });

      it('does not re-render', async () => {
        const tag = genName();

        @element(tag, {extends: 'a'})
        // @ts-ignore
        class Test extends fixtureMixin(HTMLAnchorElement) {}

        const test = fixtureSync(`<a is="${tag}"></a>`) as Test;
        await test.updateComplete;

        expect(schedulerSpy).not.toHaveBeenCalled();
      });

      it('creates ShadowRoot for allowed elements', async () => {
        const tag = genName();

        @element(tag, {extends: 'span'})
        class Test extends fixtureMixin(HTMLSpanElement) {}

        const test = fixtureSync(`<span is="${tag}"></span>`) as Test;
        await test.updateComplete;

        expect(test.shadowRoot).not.toBeUndefined();
      });

      it('creates LightDOM for other elements', async () => {
        const tag = genName();

        @element(tag, {extends: 'a'})
        class Test extends fixtureMixin(HTMLAnchorElement) {}

        const test = fixtureSync(`<a is="${tag}"></a>`) as Test;
        await test.updateComplete;

        expect(test.shadowRoot).toBeNull();
      });
    });
  });
};

export default testElementDecorator;
