// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from 'lit-html';
import {html} from 'lit-html/lib/lit-extended';
// tslint:disable-next-line:no-implicit-dependencies
import uuid from 'uuid/v4';
import CorpusculeElement, {AttributeDescriptor, PropertyGuard, PropertyList} from '../src';

const timeRemaining = () => 1;
const createAndMount = <T extends Function>(
  name: string,
  element: T,
  beforeMount: (el: HTMLElement) => void = () => void 0,
): HTMLElement => {
  customElements.define(name, element);

  const el = document.createElement(name);
  beforeMount(el);
  document.body.appendChild(el);

  return el;
};

describe('CorpusculeElement', () => {
  let ricSpy: jasmine.Spy;

  beforeEach(() => {
    ricSpy = spyOn(window as any, 'requestIdleCallback');
    ricSpy.and.callFake((next: Function) => {
      next({timeRemaining});
    });
  });

  afterEach(() => {
    const {body} = document;

    while (body.firstChild) {
      body.removeChild(body.firstChild);
    }
  });

  describe('basics', () => {
    it('should allow to create basic custom element', () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected _render(): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      createAndMount(Test.is, Test);

      const collection = document.body.getElementsByTagName(Test.is);
      expect(collection.length).toBe(1);

      const el = collection.item(0);
      expect(el).toEqual(jasmine.any(Test));

      const root = el.shadowRoot;
      expect(root).not.toBeNull();

      const node = root!.getElementById('node');
      expect(node).not.toBeNull();
      expect(node!.textContent).toBe('Test content');
    });

    it('should call _didMount() callback on mounting', () => {
      const spy = jasmine.createSpy('OnMount');

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected _didMount(): void {
          spy();
        }

        protected _render(): TemplateResult {
          return html`<span>Test content</span>`;
        }
      }

      createAndMount(Test.is, Test);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call _didUnmount() callback on unmounting', () => {
      const spy = jasmine.createSpy('OnUnmount');

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected _didUnmount(): void {
          spy();
        }

        protected _render(): TemplateResult {
          return html`<span>Test content</span>`;
        }
      }

      const el = createAndMount(Test.is, Test);
      document.body.removeChild(el);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should update by calling forceUpdate()', async () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        public num: number = 1;

        protected _render(): TemplateResult {
          return html`<span id="node">Test content #${this.num}</span>`;
        }
      }

      const el = createAndMount(Test.is, Test) as Test;

      const node = el.shadowRoot!.getElementById('node')!;
      expect(node.textContent).toBe('Test content #1');

      el.num = 2;
      expect(node.textContent).toBe('Test content #1');

      await el.forceUpdate();

      expect(node.textContent).toBe('Test content #2');
    });

    it('should call _didUpdate() on every update', async () => {
      const spy = jasmine.createSpy('OnUpdate');

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        public num: number = 1;

        protected _didUpdate(): void {
          spy();
        }

        protected _render(): TemplateResult {
          return html`<span id="node">Test content #${this.num}</span>`;
        }
      }

      const el = createAndMount(Test.is, Test) as Test;
      el.num = 2;

      await el.forceUpdate();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('properties', () => {
    it('should update on attribute change', () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _attributes(): PropertyList<AttributeDescriptor> {
          return {
            index: ['idx', Number],
          };
        }

        public index?: number;

        protected _render(): TemplateResult {
          return html`<span id="node">${
            this.index !== undefined
              ? `#${this.index}`
              : 'Nothing'
          }</span>`;
        }
      }

      const el = createAndMount(Test.is, Test) as Test;

      const node = el.shadowRoot!.getElementById('node')!;

      expect(node.textContent).toBe('Nothing');

      el.setAttribute('idx', '2');

      expect(node.textContent).toBe('#2');
    });

    it('should set default attribute value if no attribute is set before mounting', () => {
      class Test1 extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _attributes(): PropertyList<AttributeDescriptor> {
          return {
            index: ['idx', Number],
          };
        }

        public index: number = 10;

        protected _render(): TemplateResult {
          return html`<span id="node">#${this.index}</span>`;
        }
      }

      const el = createAndMount(Test1.is, Test1) as Test1;

      const node = el.shadowRoot!.getElementById('node')!;

      expect(node.textContent).toBe('#10');
    });

    it('should update on property change', () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _properties(): PropertyList<PropertyGuard> {
          return {
            index: null,
          };
        }

        public index: number = 1;

        protected _render(): TemplateResult {
          return html`<span id="node">#${this.index}</span>`;
        }
      }

      const el = createAndMount(Test.is, Test) as Test;
      const node = el.shadowRoot!.getElementById('node')!;

      expect(node.textContent).toBe('#1');

      el.index = 2;

      expect(node.textContent).toBe('#2');
    });

    it('should update on state change', () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _states(): ReadonlyArray<string> {
          return ['__index'];
        }

        private __index: number = 1;

        public updateIndexTo(i: number): void {
          this.__index = i;
        }

        protected _render(): TemplateResult {
          return html`<span id="node">#${this.__index}</span>`;
        }
      }

      const el = createAndMount(Test.is, Test) as Test;
      const node = el.shadowRoot!.getElementById('node')!;

      expect(node.textContent).toBe('#1');

      el.updateIndexTo(2);

      expect(node.textContent).toBe('#2');
    });

    it('should call _didUpdate() with proper prevProperties and prevState', async () => {
      const spy = jasmine.createSpy('OnUpdate');

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _attributes(): PropertyList<AttributeDescriptor> {
          return {
            attr: ['attr', String],
          };
        }

        protected static get _properties(): PropertyList<PropertyGuard> {
          return {
            prop: null,
          };
        }

        protected static get _states(): ReadonlyArray<string> {
          return ['__state'];
        }

        public attr: string = 'zeroAttr';
        public prop: string = 'zeroProp';

        private __state: string = 'zeroState';

        public updateState(str: string): void {
          this.__state = str;
        }

        protected _didUpdate(...args: any[]): void {
          spy(...args);
        }

        protected _render(): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      const el = createAndMount(Test.is, Test) as Test;

      el.setAttribute('attr', 'oneAttr');

      expect(spy).toHaveBeenCalledWith({
        attr: 'zeroAttr',
        prop: 'zeroProp',
      }, {
        __state: 'zeroState',
      });

      el.prop = 'oneProp';

      expect(spy).toHaveBeenCalledWith({
        attr: 'oneAttr',
        prop: 'zeroProp',
      }, {
        __state: 'zeroState',
      });

      el.updateState('oneState');

      expect(spy).toHaveBeenCalledWith({
        attr: 'oneAttr',
        prop: 'oneProp',
      }, {
        __state: 'zeroState',
      });

      el.setAttribute('attr', 'twoAttr');

      expect(spy).toHaveBeenCalledWith({
        attr: 'oneAttr',
        prop: 'oneProp',
      }, {
        __state: 'oneState',
      });
    });
  });
});
