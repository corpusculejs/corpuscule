// tslint:disable:max-classes-per-file
import {attribute} from '../../src';
import {initAttributes} from '../../src/decorators/attribute';

class HTMLElementMock {
  public readonly attributes: Map<string, string> = new Map();

  public connectedCallback(): void {
    initAttributes(this);
  }

  public getAttribute(key: string): string | null {
    return this.attributes.has(key)
      ? this.attributes.get(key)!
      : null;
  }

  public hasAttribute(key: string): boolean {
    return this.attributes.has(key);
  }

  public removeAttribute(key: string): void {
    this.attributes.delete(key);
  }

  public setAttribute(key: string, value: unknown): void {
    const v = String(value);
    this.attributes.set(key, v);
  }
}

const testAttributeDecorator = () => {
  describe('@attribute', () => {
    it('gets string attribute', () => {
      class Test extends HTMLElementMock {
        public readonly attributes: Map<string, string> = new Map([['attr', 'str']]);

        @attribute('attr', String)
        public attribute?: string;
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
        public attr1?: boolean;

        @attribute('a2', Boolean)
        public attr2?: boolean;
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
        public numAttribute?: number;
      }

      const test = new Test();
      test.connectedCallback();

      expect(test.numAttribute).toBe(10);
    });

    it('sets string attribute', () => {
      class Test extends HTMLElementMock {
        @attribute('attr', String)
        public attribute?: string;
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
        public attr1?: boolean;

        @attribute('a2', Boolean)
        public attr2?: boolean;
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
        public numAttribute?: number;
      }

      const test = new Test();
      test.connectedCallback();

      test.numAttribute = 10;

      expect(test.attributes).toEqual(new Map([['num', '10']]));
    });

    it('initializes attributes', () => {
      class Test extends HTMLElementMock {
        @attribute('str', String)
        public strAttribute: string = 'str';

        @attribute('bool', Boolean)
        public boolAttribute: boolean = true;

        @attribute('num', Number)
        public numAttribute: number = 10;
      }

      const test = new Test();
      test.connectedCallback();

      expect(test.attributes).toEqual(new Map([
        ['str', 'str'],
        ['bool', ''],
        ['num', '10'],
      ]));
    });

    it('throws an error if guard is not Number, String or Boolean', () => {
      expect(() => {
        // @ts-ignore
        class Test {
          @attribute('attr', Object as any)
          public attribute?: object;
        }
      }).toThrow(new TypeError('Guard for @attribute should be either Number, Boolean or String'));
    });

    it('throws an error if value does not fit guard', () => {
      class Test extends HTMLElementMock {
        @attribute('num', Number)
        public numAttribute?: number;
      }

      const test = new Test();
      test.connectedCallback();

      expect(() => {
        (test as any).numAttribute = 'str';
      }).toThrow(new TypeError('Value applied to "numAttribute" is not Number or undefined'));
    });

    it('gets undefined if no attribute exist', () => {
      class Test extends HTMLElementMock {
        @attribute('num', Number)
        public numAttribute?: number;
      }

      const test = new Test();
      test.connectedCallback();

      expect(test.numAttribute).toBeUndefined();
    });
  });
};

export default testAttributeDecorator;
