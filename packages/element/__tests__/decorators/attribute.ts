// tslint:disable:max-classes-per-file
import {attribute} from '../../src';
import {invalidate as $$invalidate} from '../../src/tokens/internal';

class CorpusculeElementMock {
  public static readonly observedAttributes?: ReadonlyArray<string>;
  public readonly attributes: Map<string, string> = new Map();

  public attributeChangedCallback(
    _key: PropertyKey,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {} // tslint:disable-line:no-empty

  // tslint:disable-next-line:no-empty
  public connectedCallback(): void {}

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
    this.attributeChangedCallback(
      key,
      this.attributes.has(key)
        ? this.attributes.get(key)!
        : null,
      v,
    );
    this.attributes.set(key, v);
  }

  // tslint:disable-next-line:no-empty
  public [$$invalidate](): void {}
}

const testAttributeDecorator = () => {
  describe('@attribute', () => {
    it('gets string attribute', () => {
      class Test extends CorpusculeElementMock {
        public readonly attributes: Map<string, string> = new Map([['attr', 'str']]);

        @attribute('attr', String)
        public attribute?: string;
      }

      const test = new Test();
      test.connectedCallback();

      expect(test.attribute).toBe('str');
    });

    it('properly gets boolean attribute', () => {
      class Test extends CorpusculeElementMock {
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
      class Test extends CorpusculeElementMock {
        public readonly attributes: Map<string, string> = new Map([['num', '10']]);

        @attribute('num', Number)
        public numAttribute?: number;
      }

      const test = new Test();
      test.connectedCallback();

      expect(test.numAttribute).toBe(10);
    });

    it('sets string attribute', () => {
      class Test extends CorpusculeElementMock {
        @attribute('attr', String)
        public attribute?: string;
      }

      const test = new Test();
      test.connectedCallback();

      test.attribute = 'str';

      expect(test.attributes).toEqual(new Map([['attr', 'str']]));
    });

    it('properly sets boolean attributes', () => {
      class Test extends CorpusculeElementMock {
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
      class Test extends CorpusculeElementMock {
        @attribute('num', Number)
        public numAttribute?: number;
      }

      const test = new Test();
      test.connectedCallback();

      test.numAttribute = 10;

      expect(test.attributes).toEqual(new Map([['num', '10']]));
    });

    it('initializes attributes', () => {
      class Test extends CorpusculeElementMock {
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

    it('initializes and fills "observedAttributes"', () => {
      class Test extends CorpusculeElementMock {
        @attribute('a1', Boolean)
        public attr1: boolean = true;

        @attribute('a2', String)
        public attr2: string = 'str';
      }

      expect(Test.observedAttributes).toEqual(['a1', 'a2']);
    });

    it('runs "attributeChangedCallback" and [$$invalidate] on change', () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');
      const invalidateSpy = jasmine.createSpy('onInvalidate');

      class Test extends CorpusculeElementMock {
        @attribute('attr', String)
        public attribute: string = 'str';

        public attributeChangedCallback(...args: Array<unknown>): void {
          attributeChangedCallbackSpy(...args);
        }

        public [$$invalidate](): void {
          invalidateSpy();
        }
      }

      const test = new Test();
      test.connectedCallback();

      test.attribute = 'test';

      expect(attributeChangedCallbackSpy).toHaveBeenCalledWith('attr', 'str', 'test');
      expect(attributeChangedCallbackSpy).toHaveBeenCalledTimes(2);
      expect(invalidateSpy).toHaveBeenCalledTimes(2);
    });

    it('ignores update if values are identical', () => {
      const attributeChangedCallbackSpy = jasmine.createSpy('onAttributeChange');
      const invalidateSpy = jasmine.createSpy('onInvalidate');

      class Test extends CorpusculeElementMock {
        @attribute('attr', Number)
        public attribute: number = 10;

        public attributeChangedCallback(...args: Array<unknown>): void {
          attributeChangedCallbackSpy(...args);
        }

        public [$$invalidate](): void {
          invalidateSpy();
        }
      }

      const test = new Test();
      test.connectedCallback();

      test.attribute = 10;

      expect(attributeChangedCallbackSpy).toHaveBeenCalledTimes(1);
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
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
      class Test extends CorpusculeElementMock {
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
      class Test extends CorpusculeElementMock {
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
