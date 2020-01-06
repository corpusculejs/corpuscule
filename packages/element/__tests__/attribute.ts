/* eslint-disable max-classes-per-file */
import {defineCE, fixture} from '@open-wc/testing-helpers';
import {CustomElement} from '../../../test/utils';
import {attribute} from '../src';

describe('@corpuscule/element', () => {
  describe('@attribute', () => {
    it('gets string attribute', async () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: readonly string[] = [];

        @attribute('attr', String)
        public attribute: string | null = null;
      }

      const tag = defineCE(Test);
      const test = await fixture<Test>(`<${tag} attr="str"></${tag}>`);

      expect(test.attribute).toBe('str');
    });

    it('properly gets boolean attribute', async () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: readonly string[] = [];

        @attribute('a1', Boolean)
        public attr1: boolean | null = null;

        @attribute('a2', Boolean)
        public attr2: boolean | null = null;
      }

      const tag = defineCE(Test);
      const test = await fixture<Test>(`<${tag} a1></${tag}>`);

      expect(test.attr1).toBeTruthy();
      expect(test.attr2).not.toBeTruthy();
    });

    it('properly gets number attributes', async () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: readonly string[] = [];

        @attribute('num', Number)
        public numAttribute: number | null = null;
      }

      const tag = defineCE(Test);
      const test = await fixture<Test>(`<${tag} num="10"></${tag}>`);

      expect(test.numAttribute).toBe(10);
    });

    it('sets string attribute', async () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: readonly string[] = [];

        @attribute('attr', String)
        public attribute: string | null = null;
      }

      const tag = defineCE(Test);
      const test = await fixture<Test>(`<${tag}></${tag}>`);

      test.attribute = 'str';

      expect(test.getAttribute('attr')).toBe('str');
    });

    it('properly sets boolean attributes', async () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: readonly string[] = [];

        @attribute('a1', Boolean)
        public attr1: boolean | null = null;

        @attribute('a2', Boolean)
        public attr2: boolean | null = null;
      }

      const tag = defineCE(Test);
      const test = await fixture<Test>(`<${tag} a2></${tag}>`);

      test.attr1 = true;
      test.attr2 = false;

      expect(test.getAttribute('a1')).toBe('');
      expect(test.hasAttribute('a2')).toBeFalsy();
    });

    it('properly sets number attribute', async () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: readonly string[] = [];

        @attribute('num', Number)
        public numAttribute: number | null = null;
      }

      const tag = defineCE(Test);
      const test = await fixture<Test>(`<${tag}></${tag}>`);

      test.numAttribute = 10;

      expect(test.getAttribute('num')).toBe('10');
    });

    it('initializes and fills "observedAttributes"', () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: readonly string[] = [];

        @attribute('a1', Boolean)
        public attr1: boolean | null = null;

        @attribute('a2', String)
        public attr2: string | null = null;
      }

      defineCE(Test);
      expect(Test.observedAttributes).toEqual(['a1', 'a2']);
    });

    it('runs "attributeChangedCallback" on change', async () => {
      const attributeChangedCallbackSpy = jasmine.createSpy(
        'onAttributeChange',
      );

      class Test extends CustomElement {
        public static readonly observedAttributes: readonly string[] = [];

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

      const tag = defineCE(Test);
      const test = await fixture<Test>(`<${tag}></${tag}>`);

      test.attribute = 'test';

      expect(attributeChangedCallbackSpy).toHaveBeenCalledWith(
        'attr',
        null,
        'test',
      );
      expect(attributeChangedCallbackSpy).toHaveBeenCalledTimes(1);
    });

    it('throws an error if guard is not Number, String or Boolean', () => {
      expect(() => {
        // @ts-ignore
        class Test {
          @attribute('attr', Object as any)
          public attribute: object | null = null;
        }
      }).toThrow(
        new TypeError(
          'Guard for @attribute should be either Number, Boolean or String',
        ),
      );
    });

    it('throws an error if value does not fit guard', async () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: readonly string[] = [];

        @attribute('num', Number)
        public numAttribute: number | null = null;
      }

      const tag = defineCE(Test);
      const test = await fixture<Test>(`<${tag}></${tag}>`);

      expect(() => {
        (test as any).numAttribute = 'str';
      }).toThrow(
        new TypeError(
          'Value applied to "numAttribute" is not Number or undefined',
        ),
      );
    });

    it('gets null if no attribute exist', async () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: readonly string[] = [];

        @attribute('num', Number)
        public numAttribute: number | null = null;
      }

      const tag = defineCE(Test);
      const test = await fixture<Test>(`<${tag}></${tag}>`);

      expect(test.numAttribute).toBeNull();
    });

    it('accepts both null and undefined as a value of attribute', async () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: readonly string[] = [];

        @attribute('a1', Number)
        public a1: number | null = 10;

        @attribute('a2', Number)
        public a2?: number | null = 20;
      }

      const tag = defineCE(Test);
      const test = await fixture<Test>(`<${tag}></${tag}>`);

      expect(() => {
        test.a1 = null;
        test.a2 = undefined;
      }).not.toThrow();
    });

    it('delays setting observedAttributes to the end of class creation', () => {
      class Test extends CustomElement {
        public static readonly observedAttributes: readonly string[] = [];
        @attribute('attr', Boolean) public attribute: boolean = false;
      }

      expect((Test as any).__registrations).toEqual([jasmine.any(Function)]);
    });
  });
});
