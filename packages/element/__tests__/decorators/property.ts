// tslint:disable:max-classes-per-file
import {property, propertyChangedCallback} from '../../src';

class CorpusculeElementMock {
  public [propertyChangedCallback](
    _key: PropertyKey,
    _oldValue: unknown,
    _newValue: unknown,
  ): void { // tslint:disable-line:no-empty
  }
}

const testPropertyDecorator = () => {
  describe('@property', () => {
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
      const propertyChangedCallbackSpy = jasmine.createSpy('onPropertyChanged');

      class Test extends CorpusculeElementMock {
        @property()
        public prop: number = 10;

        public [propertyChangedCallback](...args: Array<unknown>): void {
          propertyChangedCallbackSpy(...args);
        }
      }

      const test = new Test();
      test.prop = 20;

      expect(propertyChangedCallbackSpy).toHaveBeenCalledWith('prop', 10, 20);
      expect(propertyChangedCallbackSpy).toHaveBeenCalledTimes(1);
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
  });
};

export default testPropertyDecorator;
