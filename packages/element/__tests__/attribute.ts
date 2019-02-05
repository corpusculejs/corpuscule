// tslint:disable:max-classes-per-file
import {CustomElement, genName} from '../../../test/utils';
import {attribute} from '../src';

const testAttributeDecorator = () => {
  describe('@attribute', () => {
    it('gets string attribute', () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: ReadonlyArray<string> = [];

        @attribute('attr', String)
        public attribute: string | null = null;
      }

      customElements.define(genName(), Test);

      const test = new Test();
      test.setAttribute('attr', 'str');
      test.connectedCallback();

      expect(test.attribute).toBe('str');
    });

    it('properly gets boolean attribute', () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: ReadonlyArray<string> = [];

        @attribute('a1', Boolean)
        public attr1: boolean | null = null;

        @attribute('a2', Boolean)
        public attr2: boolean | null = null;
      }

      customElements.define(genName(), Test);

      const test = new Test();
      test.setAttribute('a1', '');
      test.connectedCallback();

      expect(test.attr1).toBeTruthy();
      expect(test.attr2).not.toBeTruthy();
    });

    it('properly gets number attributes', () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: ReadonlyArray<string> = [];

        @attribute('num', Number)
        public numAttribute: number | null = null;
      }

      customElements.define(genName(), Test);

      const test = new Test();
      test.setAttribute('num', '10');
      test.connectedCallback();

      expect(test.numAttribute).toBe(10);
    });

    it('sets string attribute', () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: ReadonlyArray<string> = [];

        @attribute('attr', String)
        public attribute: string | null = null;
      }

      customElements.define(genName(), Test);

      const test = new Test();
      test.connectedCallback();

      test.attribute = 'str';

      expect(test.getAttribute('attr')).toBe('str');
    });

    it('properly sets boolean attributes', () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: ReadonlyArray<string> = [];

        @attribute('a1', Boolean)
        public attr1: boolean | null = null;

        @attribute('a2', Boolean)
        public attr2: boolean | null = null;
      }

      customElements.define(genName(), Test);

      const test = new Test();
      test.setAttribute('a2', '');
      test.connectedCallback();

      test.attr1 = true;
      test.attr2 = false;

      expect(test.getAttribute('a1')).toBe('');
      expect(test.hasAttribute('a2')).toBeFalsy();
    });

    it('properly sets number attribute', () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: ReadonlyArray<string> = [];

        @attribute('num', Number)
        public numAttribute: number | null = null;
      }

      customElements.define(genName(), Test);

      const test = new Test();
      test.connectedCallback();

      test.numAttribute = 10;

      expect(test.getAttribute('num')).toBe('10');
    });

    it('initializes and fills "observedAttributes"', () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: ReadonlyArray<string> = [];

        @attribute('a1', Boolean)
        public attr1: boolean | null = null;

        @attribute('a2', String)
        public attr2: string | null = null;
      }

      customElements.define(genName(), Test);

      expect(Test.observedAttributes).toEqual(['a1', 'a2']);
    });

    it('runs "attributeChangedCallback" on change', () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');

      class Test extends CustomElement {
        public static readonly observedAttributes: ReadonlyArray<string> = [];

        @attribute('attr', String)
        public attribute: string | null = null;

        public attributeChangedCallback(
          attributeName: string,
          oldValue: string,
          newValue: string,
        ): void {
          attributeChangedCallbackSpy(attributeName, oldValue, newValue);
        }
      }

      customElements.define(genName(), Test);

      const test = new Test();

      test.attribute = 'test';

      expect(attributeChangedCallbackSpy).toHaveBeenCalledWith('attr', null, 'test');
      expect(attributeChangedCallbackSpy).toHaveBeenCalledTimes(1);
    });

    it('throws an error if guard is not Number, String or Boolean', () => {
      expect(() => {
        // @ts-ignore
        class Test {
          @attribute('attr', Object as any)
          public attribute: object | null = null;
        }
      }).toThrow(new TypeError('Guard for @attribute should be either Number, Boolean or String'));
    });

    it('throws an error if value does not fit guard', () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: ReadonlyArray<string> = [];

        @attribute('num', Number)
        public numAttribute: number | null = null;
      }

      customElements.define(genName(), Test);

      const test = new Test();
      test.connectedCallback();

      expect(() => {
        (test as any).numAttribute = 'str';
      }).toThrow(new TypeError('Value applied to "numAttribute" is not Number or undefined'));
    });

    it('gets null if no attribute exist', () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: ReadonlyArray<string> = [];

        @attribute('num', Number)
        public numAttribute: number | null = null;
      }

      customElements.define(genName(), Test);

      const test = new Test();
      test.connectedCallback();

      expect(test.numAttribute).toBeNull();
    });

    it('accepts both null and undefined as a value of attribute', () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: ReadonlyArray<string> = [];

        @attribute('a1', Number)
        public a1: number | null = 10;

        @attribute('a2', Number)
        public a2?: number | null = 20;
      }

      customElements.define(genName(), Test);

      const test = new Test();

      expect(() => {
        test.a1 = null;
        test.a2 = undefined;
      }).not.toThrow();
    });
  });
};

export default testAttributeDecorator;
