// tslint:disable:no-unbound-method
import {fixtureSync} from '@open-wc/testing-helpers';
import {createTestingPromise, CustomElement, genName} from '../../../test/utils';
import {
  createElementDecorator,
  createRoot,
  internalChangedCallback,
  propertyChangedCallback,
  render,
  updatedCallback,
} from '../src';

const testElementDecorator = () => {
  describe('@element', () => {
    let define: jasmine.Spy;
    let element: (name: string, params?: {extends?: keyof HTMLElementTagNameMap}) => ClassDecorator;
    let rendererSpy: jasmine.Spy;
    let schedulerSpy: jasmine.Spy;

    const runRender = () => {
      const [renderCallback] = schedulerSpy.calls.mostRecent().args;
      renderCallback();
    };

    beforeEach(() => {
      rendererSpy = jasmine.createSpy('onTemplateRender');
      schedulerSpy = jasmine.createSpy('onSchedule');
      define = spyOn(customElements, 'define');
      define.and.callThrough();

      element = createElementDecorator({renderer: rendererSpy, scheduler: schedulerSpy});
    });

    it('adds element to a custom elements registry', () => {
      const name = genName();

      @element(name)
      class Test extends CustomElement {
        protected [render](): null {
          return null;
        }
      }

      expect(define).toHaveBeenCalledWith(name, Test, undefined);
    });

    it('adds "is" readonly field with name to element', () => {
      const name = genName();

      @element(name)
      class Test extends CustomElement {
        public static readonly is: string;

        protected [render](): null {
          return null;
        }
      }

      expect(Test.is).toBe(name);
    });

    it('defines invalidate function only if [render] is present', async () => {
      const tag = genName();
      const [promise, resolve] = createTestingPromise();

      @element(tag)
      // @ts-ignore
      class Test extends HTMLElement {
        public connectedCallback(): void {
          resolve();
        }
      }

      fixtureSync(`<${tag}></${tag}>`);

      await promise;

      expect(schedulerSpy).not.toHaveBeenCalled();
    });

    it('renders on element connection', async () => {
      const connectedCallbackSpy = jasmine.createSpy('onConnect');

      const tag = genName();
      const [promise, resolve] = createTestingPromise();

      @element(tag)
      // @ts-ignore
      class Test extends CustomElement {
        public connectedCallback(): void {
          connectedCallbackSpy();
          resolve();
        }

        protected [render](): null {
          return null;
        }
      }

      fixtureSync(`<${tag}></${tag}>`);
      await promise;

      expect(connectedCallbackSpy).toHaveBeenCalled();
      expect(schedulerSpy).toHaveBeenCalled();
    });

    it('re-renders on each attribute change', () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');

      const tag = genName();

      @element(tag)
      class Test extends CustomElement {
        public attributeChangedCallback(...args: Array<unknown>): void {
          attributeChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = fixtureSync(`<${tag}></${tag}>`) as Test;
      runRender();

      test.attributeChangedCallback('test', 'old', 'new');
      expect(attributeChangedCallbackSpy).toHaveBeenCalledWith('test', 'old', 'new');
      expect(schedulerSpy).toHaveBeenCalledTimes(2);
    });

    it('re-renders on each [propertyChangedCallback]', () => {
      const propertyChangedCallbackSpy = jasmine.createSpy('onPropertyChange');

      const tag = genName();

      @element(tag)
      class Test extends CustomElement {
        public [propertyChangedCallback](...args: Array<unknown>): void {
          propertyChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = fixtureSync(`<${tag}></${tag}>`) as Test;
      runRender();

      test[propertyChangedCallback]('test', 'old', 'new');
      expect(propertyChangedCallbackSpy).toHaveBeenCalledWith('test', 'old', 'new');
      expect(schedulerSpy).toHaveBeenCalledTimes(2);
    });

    it('re-renders on each [internalChangedCallback]', () => {
      const internalChangedCallbackSpy = jasmine.createSpy('onInternalChange');

      const tag = genName();

      @element(tag)
      class Test extends CustomElement {
        public [internalChangedCallback](...args: Array<unknown>): void {
          internalChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = fixtureSync(`<${tag}></${tag}>`) as Test;
      runRender();

      test[internalChangedCallback]('test', 'old', 'new');
      expect(internalChangedCallbackSpy).toHaveBeenCalledWith('test', 'old', 'new');
      expect(schedulerSpy).toHaveBeenCalledTimes(2);
    });

    it('calls [updatedCallback] on each re-render', async () => {
      const updatedCallbackSpy = jasmine.createSpy('onUpdate');

      const [connectedPromise, connectedResolve] = createTestingPromise();
      const [updatedPromise, updatedResolve] = createTestingPromise();

      const tag = genName();

      @element(tag)
      class Test extends CustomElement {
        public connectedCallback(): void {
          connectedResolve();
        }

        public [updatedCallback](): void {
          updatedCallbackSpy();
          updatedResolve();
        }

        public [render](): null {
          return null;
        }
      }

      const test = fixtureSync(`<${tag}></${tag}>`) as Test;
      runRender();

      await connectedPromise;

      // This commands causes update
      test.attributeChangedCallback('test', '1', '2');
      runRender();

      await updatedPromise;

      expect(updatedCallbackSpy).toHaveBeenCalledTimes(1);
    });

    it('sends to the renderer function result of [render]', () => {
      const tag = genName();

      @element(tag)
      class Test extends CustomElement {
        public [render](): string {
          return 'rendered string';
        }
      }

      const test = fixtureSync(`<${tag}></${tag}>`) as Test;
      runRender();

      expect(rendererSpy).toHaveBeenCalledWith('rendered string', jasmine.any(Node), test);
    });

    it('does not allow to run re-render if old and new values are identical (except for internal)', () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');
      const propertyChangedCallbackSpy = jasmine.createSpy('onPropertyChange');
      const internalChangedCallbackSpy = jasmine.createSpy('onInternalChange');

      const tag = genName();

      @element(tag)
      class Test extends CustomElement {
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
      runRender();
      schedulerSpy.calls.reset();

      test.attributeChangedCallback('attr', 'same', 'same');
      test[propertyChangedCallback]('prop', 'same', 'same');
      test[internalChangedCallback]('internal', 'same', 'same');

      expect(attributeChangedCallbackSpy).not.toHaveBeenCalled();
      expect(propertyChangedCallbackSpy).not.toHaveBeenCalled();

      expect(internalChangedCallbackSpy).toHaveBeenCalled();
      expect(schedulerSpy).toHaveBeenCalledTimes(1);
    });

    it('does not allow to use [updatedCallback] and changed callbacks when not connected', () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');
      const propertyChangedCallbackSpy = jasmine.createSpy('onPropertyChange');
      const internalChangedCallbackSpy = jasmine.createSpy('onInternalChange');

      const tag = genName();

      @element(tag)
      class Test extends CustomElement {
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

      runRender();

      expect(attributeChangedCallbackSpy).not.toHaveBeenCalled();
      expect(propertyChangedCallbackSpy).not.toHaveBeenCalled();
      expect(internalChangedCallbackSpy).not.toHaveBeenCalled();
      // only during the connection
      expect(schedulerSpy).toHaveBeenCalledTimes(1);
    });

    it('makes only one render on multiple property change', () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');

      const tag = genName();

      @element(tag)
      class Test extends CustomElement {
        public attributeChangedCallback(...args: Array<unknown>): void {
          attributeChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = fixtureSync(`<${tag}></${tag}>`) as Test;
      runRender();
      schedulerSpy.calls.reset();

      test.attributeChangedCallback('attr', 'old', 'new');
      test.attributeChangedCallback('attr', 'old', 'new');

      expect(attributeChangedCallbackSpy).toHaveBeenCalledTimes(2);
      expect(schedulerSpy).toHaveBeenCalledTimes(1);
    });

    it('allows to change root element', () => {
      const root = document.createElement('div');

      const tag = genName();

      @element(tag)
      // @ts-ignore
      class Test extends CustomElement {
        public [createRoot](): Element | DocumentFragment {
          return root;
        }

        public [render](): string {
          return 'render';
        }
      }

      fixtureSync(`<${tag}></${tag}>`);
      runRender();

      expect(rendererSpy).toHaveBeenCalledWith('render', root, jasmine.any(Object));
    });

    it('does not throw an error if class already have own lifecycle element', () => {
      expect(() => {
        @element(genName())
        // @ts-ignore
        class Test extends CustomElement {
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
        class Parent extends CustomElement {
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

        const [promise, resolve] = createTestingPromise();

        @element(genName())
        class Parent extends CustomElement {
          public connectedCallback(): void {
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
            resolve();
          }

          public [render](): null {
            return null;
          }
        }

        fixtureSync(`<${tag}></${tag}>`);

        await promise;

        expect(schedulerSpy).toHaveBeenCalledTimes(1);
        expect(connectedSpyChild).toHaveBeenCalled();
        expect(connectedSpyParent).toHaveBeenCalled();
      });

      it('allows to override [createRoot] method', () => {
        const parentContainer = document.createElement('div');
        const childContainer = document.createElement('div');

        @element(genName())
        class Parent extends CustomElement {
          public [createRoot](): HTMLElement {
            return parentContainer;
          }

          public [render](): null {
            return null;
          }
        }

        const tag = genName();

        @element(tag)
        class Child extends Parent {
          public [createRoot](): HTMLElement {
            return childContainer;
          }

          public [render](): null {
            return null;
          }
        }

        const child = fixtureSync(`<${tag}></${tag}>`) as Child;

        const [renderCallback] = schedulerSpy.calls.mostRecent().args;
        renderCallback();

        expect(rendererSpy).toHaveBeenCalledWith(null, childContainer, child);
      });
    });

    describe('customized built-in elements', () => {
      it('allows to create', () => {
        const name = genName();

        @element(name, {extends: 'a'})
        class Test extends HTMLAnchorElement {}

        expect(customElements.define).toHaveBeenCalledWith(name, Test, {extends: 'a'});
      });

      it('does not re-render', async () => {
        const tag = genName();
        const [promise, resolve] = createTestingPromise();

        @element(tag, {extends: 'a'})
        // @ts-ignore
        class Test extends HTMLAnchorElement {
          public connectedCallback(): void {
            resolve();
          }
        }

        fixtureSync(`<a is="${tag}"></a>`);

        await promise;

        expect(schedulerSpy).not.toHaveBeenCalled();
      });

      it('creates ShadowRoot for allowed elements', async () => {
        const tag = genName();
        const [promise, resolve] = createTestingPromise();

        @element(tag, {extends: 'span'})
        class Test extends HTMLSpanElement {
          public connectedCallback(): void {
            resolve();
          }
        }

        const test = fixtureSync(`<span is="${tag}"></span>`) as Test;

        await promise;

        expect(test.shadowRoot).not.toBeUndefined();
      });

      it('creates LightDOM for other elements', async () => {
        const tag = genName();
        const [promise, resolve] = createTestingPromise();

        @element(tag, {extends: 'a'})
        class Test extends HTMLAnchorElement {
          public connectedCallback(): void {
            resolve();
          }
        }

        const test = fixtureSync(`<a is="${tag}"></a>`) as Test;

        await promise;

        expect(test.shadowRoot).toBeNull();
      });
    });
  });
};

export default testElementDecorator;
