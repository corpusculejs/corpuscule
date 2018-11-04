// tslint:disable:max-classes-per-file
import {property, propertyChangedCallback} from '../../src';
import {invalidate as $$invalidate} from '../../src/tokens/internal';

const testPropertyDecorator = () => {
  describe('@property', () => {
    let propertyChangedCallbackSpy: jasmine.Spy;
    let invalidateSpy: jasmine.Spy;
    let CorpusculeElementMock: any; // tslint:disable-line:naming-convention

    beforeEach(() => {
      propertyChangedCallbackSpy = jasmine.createSpy('onPropertyChanged');
      invalidateSpy = jasmine.createSpy('onInvalidate');

      CorpusculeElementMock = class {
        public [propertyChangedCallback](
          key: PropertyKey,
          oldValue: unknown,
          newValue: unknown,
        ): void {
          propertyChangedCallbackSpy(key, oldValue, newValue);
        }

        public [$$invalidate](): void {
          invalidateSpy();
        }
      };
    });

    it('initializes, gets and sets property', () => {
      class Test extends CorpusculeElementMock {
        @property()
        public prop: number = 10;
      }

      const test = new Test();

      expect(test.prop).toBe(10);

      test.prop = 20;

      expect(test.prop).toBe(20);
    });

    it('initializes property to an undefined if no data is set', () => {
      class Test extends CorpusculeElementMock {
        @property()
        public prop?: number;
      }

      const test = new Test();

      expect(test.prop).toBeUndefined();
    });

    it('runs [propertyChangedCallback] on property change', () => {
      class Test extends CorpusculeElementMock {
        @property()
        public prop: number = 10;
      }

      const test = new Test();
      test.prop = 20;

      expect(propertyChangedCallbackSpy).toHaveBeenCalledWith('prop', 10, 20);
      expect(propertyChangedCallbackSpy).toHaveBeenCalledTimes(1);
    });

    it('runs [$$invalidate] on property change', () => {
      class Test extends CorpusculeElementMock {
        @property()
        public prop: number = 10;
      }

      const test = new Test();
      test.prop = 20;

      expect(invalidateSpy).toHaveBeenCalledTimes(1);
    });

    it('throws an error if value does not fit guard during initialization', () => {
      class Test extends CorpusculeElementMock {
        @property((v: any) => typeof v === 'number')
        public prop: any = 'string';
      }

      expect(() => new Test())
        .toThrow(new TypeError('Value applied to "prop" has wrong type'));
    });

    it('throws an error if value does not fit guard', () => {
      class Test extends CorpusculeElementMock {
        @property((v: any) => typeof v === 'number')
        public prop: any = 10;
      }

      const test = new Test();

      expect(() => {
        test.prop = 'string';
      }).toThrow(new TypeError('Value applied to "prop" has wrong type'));
    });

    it('does not call [propertyChangedCallback] and [$$invalidate] if value is the same', () => {
      class Test extends CorpusculeElementMock {
        @property()
        public prop: number = 10;
      }

      const test = new Test();

      test.prop = 10;

      expect(propertyChangedCallbackSpy).not.toHaveBeenCalled();
      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });
};

export default testPropertyDecorator;
