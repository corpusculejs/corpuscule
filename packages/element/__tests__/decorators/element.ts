// tslint:disable:no-unnecessary-class max-classes-per-file no-unbound-method no-empty
import {createTestingPromise, CustomElement, genName} from '../../../../test/utils';
import {
  createElementDecorator,
  createRoot,
  internalChangedCallback,
  propertyChangedCallback,
  render,
  updatedCallback,
} from '../../src';

const testElementDecorator = () => {
  describe('@element', () => {
    let define: jasmine.Spy;
    let element: (name: string, params?: {extends?: keyof HTMLElementTagNameMap}) => ClassDecorator;
    let rendererSpy: jasmine.Spy;
    let schedulerSpy: jasmine.Spy;

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

    it('throws an error if [render] method is not implemented', () => {
      expect(() => {
        @element(genName())
        // @ts-ignore
        class Test extends CustomElement {}
      }).toThrowError('[render]() is not implemented');
    });

    it('renders on element connection', async () => {
      const connectedCallbackSpy = jasmine.createSpy('onConnect');

      const [promise, resolve] = createTestingPromise();

      @element(genName())
      class Test extends CustomElement {
        public connectedCallback(): void {
          connectedCallbackSpy();
          resolve();
        }

        protected [render](): null {
          return null;
        }
      }

      const test = new Test();
      test.connectedCallback();

      await promise;

      expect(connectedCallbackSpy).toHaveBeenCalled();
      expect(schedulerSpy).toHaveBeenCalled();
    });

    it('re-renders on each attribute change', () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');

      @element(genName())
      class Test extends CustomElement {
        public attributeChangedCallback(...args: Array<unknown>): void {
          attributeChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = new Test();
      test.connectedCallback();

      const [renderCallback] = schedulerSpy.calls.mostRecent().args;
      renderCallback();

      test.attributeChangedCallback('test', 'old', 'new');
      expect(attributeChangedCallbackSpy).toHaveBeenCalledWith('test', 'old', 'new');
      expect(schedulerSpy).toHaveBeenCalledTimes(2);
    });

    it('re-renders on each [propertyChangedCallback]', () => {
      const propertyChangedCallbackSpy = jasmine.createSpy('onPropertyChange');

      @element(genName())
      class Test extends CustomElement {
        public [propertyChangedCallback](...args: Array<unknown>): void {
          propertyChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = new Test();
      test.connectedCallback();

      const [renderCallback] = schedulerSpy.calls.mostRecent().args;
      renderCallback();

      test[propertyChangedCallback]('test', 'old', 'new');
      expect(propertyChangedCallbackSpy).toHaveBeenCalledWith('test', 'old', 'new');
      expect(schedulerSpy).toHaveBeenCalledTimes(2);
    });

    it('re-renders on each [internalChangedCallback]', () => {
      const internalChangedCallbackSpy = jasmine.createSpy('onInternalChange');

      @element(genName())
      class Test extends CustomElement {
        public [internalChangedCallback](...args: Array<unknown>): void {
          internalChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = new Test();
      test.connectedCallback();

      const [renderCallback] = schedulerSpy.calls.mostRecent().args;
      renderCallback();

      test[internalChangedCallback]('test', 'old', 'new');
      expect(internalChangedCallbackSpy).toHaveBeenCalledWith('test', 'old', 'new');
      expect(schedulerSpy).toHaveBeenCalledTimes(2);
    });

    it('calls [updatedCallback] on each re-render', async () => {
      const updatedCallbackSpy = jasmine.createSpy('onUpdate');

      const [connectedPromise, connectedResolve] = createTestingPromise();
      const [promise, resolve] = createTestingPromise();

      @element(genName())
      class Test extends CustomElement {
        public connectedCallback(): void {
          connectedResolve();
        }

        public [updatedCallback](): void {
          updatedCallbackSpy();
          resolve();
        }

        public [render](): null {
          return null;
        }
      }

      const test = new Test();

      // This commands proceed connecting stage
      test.connectedCallback();
      const [renderCallback] = schedulerSpy.calls.mostRecent().args;
      renderCallback();

      await connectedPromise;

      // This commands causes update
      test.attributeChangedCallback('test', '1', '2');
      const [renderCallbackForUpdate] = schedulerSpy.calls.mostRecent().args;
      renderCallbackForUpdate();

      await promise;

      expect(updatedCallbackSpy).toHaveBeenCalledTimes(1);
    });

    it('sends to the renderer function result of [render]', () => {
      @element(genName())
      class Test extends CustomElement {
        public [render](): string {
          return 'rendered string';
        }
      }

      const test = new Test();
      test.connectedCallback();

      const [renderCallback] = schedulerSpy.calls.mostRecent().args;
      renderCallback();

      expect(rendererSpy).toHaveBeenCalledWith('rendered string', jasmine.any(Node), test);
    });

    it('does not allow to run re-render if old and new values are identical (except for internal)', () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');
      const propertyChangedCallbackSpy = jasmine.createSpy('onPropertyChange');
      const internalChangedCallbackSpy = jasmine.createSpy('onInternalChange');

      @element(genName())
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

      const test = new Test();
      test.connectedCallback();

      const [renderCallback] = schedulerSpy.calls.mostRecent().args;
      renderCallback();
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

      @element(genName())
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

      const test = new Test();
      test.connectedCallback();

      test.attributeChangedCallback('attr', 'old', 'new');
      test[propertyChangedCallback]('attr', 'old', 'new');
      test[internalChangedCallback]('attr', 'old', 'new');

      const [renderCallback] = schedulerSpy.calls.mostRecent().args;
      renderCallback();

      expect(attributeChangedCallbackSpy).not.toHaveBeenCalled();
      expect(propertyChangedCallbackSpy).not.toHaveBeenCalled();
      expect(internalChangedCallbackSpy).not.toHaveBeenCalled();
      // only during the connection
      expect(schedulerSpy).toHaveBeenCalledTimes(1);
    });

    it('makes only one render on multiple property change', () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');

      @element(genName())
      class Test extends CustomElement {
        public attributeChangedCallback(...args: Array<unknown>): void {
          attributeChangedCallbackSpy(...args);
        }

        protected [render](): null {
          return null;
        }
      }

      const test = new Test();
      test.connectedCallback();

      const [renderCallback] = schedulerSpy.calls.mostRecent().args;
      renderCallback();
      schedulerSpy.calls.reset();

      test.attributeChangedCallback('attr', 'old', 'new');
      test.attributeChangedCallback('attr', 'old', 'new');

      expect(attributeChangedCallbackSpy).toHaveBeenCalledTimes(2);
      expect(schedulerSpy).toHaveBeenCalledTimes(1);
    });

    it('allows to change root element', () => {
      const root = document.createElement('div');

      @element(genName())
      class Test extends CustomElement {
        public [createRoot](): Element | DocumentFragment {
          return root;
        }

        public [render](): string {
          return 'render';
        }
      }

      const test = new Test();
      test.connectedCallback();

      const [renderCallback] = schedulerSpy.calls.mostRecent().args;
      renderCallback();

      expect(rendererSpy).toHaveBeenCalledWith('render', root, jasmine.any(Object));
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

        @element(genName())
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

        const child = new Child();
        child.connectedCallback();

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

        @element(genName())
        // @ts-ignore
        class Child extends Parent {
          public [createRoot](): HTMLElement {
            return childContainer;
          }

          public [render](): null {
            return null;
          }
        }

        const child = new Child();
        child.connectedCallback();

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

      it('does not re-render', () => {
        (customElements.define as jasmine.Spy).and.callThrough();

        @element(genName(), {extends: 'a'})
        class Test extends HTMLAnchorElement {}

        const test = new Test();

        (test as any).connectedCallback();

        expect(schedulerSpy).not.toHaveBeenCalled();
      });

      it('throws error if [render] is defined for non-shadow elements', () => {
        expect(() => {
          @element(genName(), {extends: 'a'})
          // @ts-ignore
          class Test extends HTMLAnchorElement {
            public [render](): null {
              return null;
            }
          }
        }).toThrowError('[render]() is not allowed for <a> element');
      });

      it('throws if [render] is not defined for shadow elements', () => {
        expect(() => {
          @element(genName(), {extends: 'div'})
          // @ts-ignore
          class Test extends HTMLDivElement {}
        }).toThrowError('[render]() is not implemented');
      });
    });
  });
};

export default testElementDecorator;
