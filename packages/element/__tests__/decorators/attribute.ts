// tslint:disable:max-classes-per-file
import {attribute} from '../../src';
import {HTMLElementMock} from '../utils';

const testAttributeDecorator = () => {
  describe('@attribute', () => {
    it('gets string attribute', () => {
      class Test extends HTMLElementMock {
        public readonly attributes: Map<string, string> = new Map([['attr', 'str']]);

        @attribute('attr', String)
        public attribute: string | null = null;
      }

      const test = new Test();
      test.connectedCallback();

      expect(test.attribute).toBe('str');
    });

    it('properly gets boolean attribute', () => {
      class Test extends HTMLElementMock {
        public readonly attributes: Map<string, string> = new Map([
          ['a1', ''],
        ]);

        @attribute('a1', Boolean)
        public attr1: boolean | null = null;

        @attribute('a2', Boolean)
        public attr2: boolean | null = null;
      }

      const test = new Test();
      test.connectedCallback();

      expect(test.attr1).toBeTruthy();
      expect(test.attr2).not.toBeTruthy();
    });

    it('properly gets number attributes', () => {
      class Test extends HTMLElementMock {
        public readonly attributes: Map<string, string> = new Map([['num', '10']]);

        @attribute('num', Number)
        public numAttribute: number | null = null;
      }

      const test = new Test();
      test.connectedCallback();

      expect(test.numAttribute).toBe(10);
    });

    it('sets string attribute', () => {
      class Test extends HTMLElementMock {
        @attribute('attr', String)
        public attribute: string | null = null;
      }

      const test = new Test();
      test.connectedCallback();

      test.attribute = 'str';

      expect(test.attributes).toEqual(new Map([['attr', 'str']]));
    });

    it('properly sets boolean attributes', () => {
      class Test extends HTMLElementMock {
        public readonly attributes: Map<string, string> = new Map([
          ['a2', ''],
        ]);

        @attribute('a1', Boolean)
        public attr1: boolean | null = null;

        @attribute('a2', Boolean)
        public attr2: boolean | null = null;
      }

      const test = new Test();
      test.connectedCallback();

      test.attr1 = true;
      test.attr2 = false;

      expect(test.attributes).toEqual(new Map([['a1', '']]));
    });

    it('properly sets number attribute', () => {
      class Test extends HTMLElementMock {
        @attribute('num', Number)
        public numAttribute: number | null = null;
      }

      const test = new Test();
      test.connectedCallback();

      test.numAttribute = 10;

      expect(test.attributes).toEqual(new Map([['num', '10']]));
    });

    it('initializes and fills "observedAttributes"', () => {
      class Test extends HTMLElementMock {
        @attribute('a1', Boolean)
        public attr1: boolean | null = null;

        @attribute('a2', String)
        public attr2: string | null = null;
      }

      expect(Test.observedAttributes).toEqual(['a1', 'a2']);
    });

    it('runs "attributeChangedCallback" on change', () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');

      class Test extends HTMLElementMock {
        @attribute('attr', String)
        public attribute: string | null = null;

        public attributeChangedCallback(...args: Array<unknown>): void {
          attributeChangedCallbackSpy(...args);
        }
      }

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
      class Test extends HTMLElementMock {
        @attribute('num', Number)
        public numAttribute: number | null = null;
      }

      const test = new Test();
      test.connectedCallback();

      expect(() => {
        (test as any).numAttribute = 'str';
      }).toThrow(new TypeError('Value applied to "numAttribute" is not Number or undefined'));
    });

    it('gets null if no attribute exist', () => {
      class Test extends HTMLElementMock {
        @attribute('num', Number)
        public numAttribute: number | null = null;
      }

      const test = new Test();
      test.connectedCallback();

      expect(test.numAttribute).toBeNull();
    });
  });
};

export default testAttributeDecorator;
