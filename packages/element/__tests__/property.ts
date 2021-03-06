// tslint:disable:max-classes-per-file
import {property, propertyChangedCallback} from '../src';

class CorpusculeElementMock {
  public [propertyChangedCallback](
    _key: PropertyKey,
    _oldValue: unknown,
    _newValue: unknown,
  ): void {
    // tslint:disable-line:no-empty
  }
}

describe('@corpuscule/element', () => {
  describe('@property', () => {
    it('initializes, gets and sets property', () => {
      class Test extends CorpusculeElementMock {
        @property()
        public prop: number = 10;

        @property()
        public get accessor(): string {
          return this.storage;
        }

        public set accessor(v: string) {
          this.storage = v;
        }

        private storage: string = 'str';
      }

      const test = new Test();

      expect(test.prop).toBe(10);
      expect(test.accessor).toBe('str');

      test.prop = 20;
      test.accessor = 'test';

      expect(test.prop).toBe(20);
      expect(test.accessor).toBe('test');
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

        @property()
        public get accessor(): string {
          return this.storage;
        }

        public set accessor(v: string) {
          this.storage = v;
        }

        private storage: string = 'str';

        public [propertyChangedCallback](...args: unknown[]): void {
          propertyChangedCallbackSpy(...args);
        }
      }

      const test = new Test();

      test.prop = 20;

      expect(propertyChangedCallbackSpy).toHaveBeenCalledWith('prop', 10, 20);
      expect(propertyChangedCallbackSpy).toHaveBeenCalledTimes(1);

      propertyChangedCallbackSpy.calls.reset();

      test.accessor = 'test';

      expect(propertyChangedCallbackSpy).toHaveBeenCalledWith('accessor', 'str', 'test');
      expect(propertyChangedCallbackSpy).toHaveBeenCalledTimes(1);
    });

    it('runs [propertyChangedCallback] after the property is set', () => {
      const propertyChangedCallbackSpy = jasmine.createSpy('onPropertyChanged');

      class Test extends CorpusculeElementMock {
        @property()
        public prop: number = 10;

        public [propertyChangedCallback](_name: string, _oldValue: number, newValue: number): void {
          propertyChangedCallbackSpy();
          expect(this.prop).toBe(newValue);
        }
      }

      const test = new Test();
      test.prop = 20;

      expect(propertyChangedCallbackSpy).toHaveBeenCalledTimes(1);
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
});
