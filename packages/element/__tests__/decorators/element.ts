import {HTMLElementMock} from '../../../../test/utils';

// tslint:disable:no-unnecessary-class max-classes-per-file no-unbound-method no-empty
import {
  createRoot,
  element,
  internalChangedCallback,
  propertyChangedCallback,
  render,
  updatedCallback,
} from '../../src';

const testElementDecorator = () => {
  describe('@element', () => {
    let rendererSpy: jasmine.Spy;
    let schedulerSpy: jasmine.Spy;

    beforeEach(() => {
      rendererSpy = jasmine.createSpy('onTemplateRender');
      schedulerSpy = jasmine.createSpy('onSchedule');
      spyOn(customElements, 'define');
    });

    it('adds element to a custom elements registry', () => {
      @element('x-test')
      class Test extends HTMLElementMock {
        protected [render](): null {
          return null;
        }
      }

      expect(customElements.define).toHaveBeenCalledWith('x-test', Test);
    });

    it('adds "is" readonly field with name to element', () => {
      @element('x-test')
      class Test extends HTMLElementMock {
        public static readonly is: string;

        protected [render](): null {
          return null;
        }
      }

      expect(Test.is).toBe('x-test');
    });

    it('throws an error if [render] method is not implemented', () => {
      expect(() => {
        @element('x-test')
          // @ts-ignore
        class Test extends HTMLElementMock {
        }
      }).toThrowError('[render]() is not implemented');
    });

    it('renders on element connection', () => {
      const connectedCallbackSpy = jasmine.createSpy('onConnect');

      @element('x-test', {scheduler: schedulerSpy})
      class Test extends HTMLElementMock {
        public connectedCallback(): void {
          connectedCallbackSpy();
        }

        protected [render](): null {
          return null;
        }
      }

      const test = new Test();
      test.connectedCallback();

      expect(connectedCallbackSpy).toHaveBeenCalled();
      expect(schedulerSpy).toHaveBeenCalled();
    });

    it('re-renders on each attribute change', () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');

      @element('x-test', {scheduler: schedulerSpy})
      class Test extends HTMLElementMock {
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

      @element('x-test', {scheduler: schedulerSpy})
      class Test extends HTMLElementMock {
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

      @element('x-test', {renderer: rendererSpy, scheduler: schedulerSpy})
      class Test extends HTMLElementMock {
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

    it('calls [updatedCallback] on each re-render', () => {
      const updatedCallbackSpy = jasmine.createSpy('onUpdate');

      @element('x-test', {scheduler: schedulerSpy})
      class Test extends HTMLElementMock {
        public [updatedCallback](): void {
          updatedCallbackSpy();
        }

        public [render](): null {
          return null;
        }
      }

      const test = new Test();
      test.connectedCallback();

      const [renderCallback] = schedulerSpy.calls.mostRecent().args;
      // this render ends mounting stage
      renderCallback();

      // this render should call [updatedCallback]
      renderCallback();

      expect(updatedCallbackSpy).toHaveBeenCalledTimes(1);
    });

    it('sends to the [renderer] function result of [render]', () => {
      @element('x-test', {renderer: rendererSpy, scheduler: schedulerSpy})
      class Test extends HTMLElementMock {
        public [render](): string {
          return 'rendered string';
        }
      }

      const test = new Test();
      test.connectedCallback();

      const [renderCallback] = schedulerSpy.calls.mostRecent().args;
      renderCallback();

      expect(rendererSpy).toHaveBeenCalledWith('rendered string', jasmine.any(HTMLElement), jasmine.any(Object));
    });

    it(
      'does not allow to run re-render if old and new values are identical (except for internal)',
      () => {
        const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');
        const propertyChangedCallbackSpy = jasmine.createSpy('onPropertyChange');
        const internalChangedCallbackSpy = jasmine.createSpy('onInternalChange');

        @element('x-test', {scheduler: schedulerSpy})
        class Test extends HTMLElementMock {
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
      },
    );

    it('does not allow to use [updatedCallback] and changed callbacks when not connected', () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');
      const propertyChangedCallbackSpy = jasmine.createSpy('onPropertyChange');
      const internalChangedCallbackSpy = jasmine.createSpy('onInternalChange');

      @element('x-test', {scheduler: schedulerSpy})
      class Test extends HTMLElementMock {
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

      @element('x-test', {scheduler: schedulerSpy})
      class Test extends HTMLElementMock {
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

      @element('x-test', {renderer: rendererSpy, scheduler: schedulerSpy})
      class Test extends HTMLElementMock {
        public static readonly shadowMock: HTMLDivElement = root;

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

    it('allows extending existing element', () => {
      @element('x-test1')
      class Test1 extends HTMLElementMock {
        public [render](): null {
          return null;
        }
      }

      @element('x-test2')
      // @ts-ignore
      class Test2 extends Test1 {
        public [render](): null {
          return null;
        }
      }

      expect(customElements.define).toHaveBeenCalledTimes(2);
    });

    it('contains property "isCorpusculeElement"', () => {
      @element('x-test')
      class Test {
        public static readonly isCorpusculeElement: boolean;

        public [render](): null {
          return null;
        }
      }

      expect(Test.isCorpusculeElement).toBeTruthy();
    });

    it('calls only child render function if child inherits parent class', () => {
      const connectedSpyParent = jasmine.createSpy('connectedCallbackParent');
      const connectedSpyChild = jasmine.createSpy('connectedCallbackChild');

      @element('x-parent', {scheduler: schedulerSpy})
      class Parent extends HTMLElementMock {
        public connectedCallback(): void {
          connectedSpyParent();
        }

        public [render](): null {
          return null;
        }
      }

      @element('x-child', {scheduler: schedulerSpy})
      class Child extends Parent {
        public connectedCallback(): void {
          super.connectedCallback();
          connectedSpyChild();
        }

        public [render](): null {
          return null;
        }
      }

      const child = new Child();
      child.connectedCallback();

      expect(schedulerSpy).toHaveBeenCalledTimes(1);
      expect(connectedSpyChild).toHaveBeenCalled();
      expect(connectedSpyParent).toHaveBeenCalled();
    });
  });
};

export default testElementDecorator;
