// tslint:disable:max-classes-per-file
import {fixture} from '@open-wc/testing-helpers/src/fixture-no-side-effect';
import {genName} from '../../../test/utils';
import {element, gear, property} from '../src';
import {fixtureMixin} from './utils';

describe('@corpuscule/element', () => {
  describe('@property', () => {
    let tag: string;

    beforeEach(() => {
      tag = genName();
    });

    it('initializes, gets and sets property', async () => {
      @element(tag)
      class Test extends fixtureMixin(HTMLElement) {
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

      const test = await fixture<Test>(`<${tag}></${tag}>`);

      expect(test.prop).toBe(10);
      expect(test.accessor).toBe('str');

      test.prop = 20;
      test.accessor = 'test';

      expect(test.prop).toBe(20);
      expect(test.accessor).toBe('test');
    });

    it('initializes property to an undefined if no data is set', async () => {
      @element(tag)
      class Test extends fixtureMixin(HTMLElement) {
        @property()
        public prop?: number;
      }

      const test = await fixture<Test>(`<${tag}></${tag}>`);

      expect(test.prop).toBeUndefined();
    });

    it('runs [propertyChangedCallback] on property change', async () => {
      const propertyChangedCallbackSpy = jasmine.createSpy('onPropertyChanged');

      @element(tag)
      class Test extends fixtureMixin(HTMLElement) {
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

        @gear()
        public propertyChangedCallback(...args: unknown[]): void {
          propertyChangedCallbackSpy(...args);
        }
      }

      const test = await fixture<Test>(`<${tag}></${tag}>`);

      test.prop = 20;

      expect(propertyChangedCallbackSpy).toHaveBeenCalledWith('prop', 10, 20);
      expect(propertyChangedCallbackSpy).toHaveBeenCalledTimes(1);

      propertyChangedCallbackSpy.calls.reset();

      test.accessor = 'test';

      expect(propertyChangedCallbackSpy).toHaveBeenCalledWith('accessor', 'str', 'test');
      expect(propertyChangedCallbackSpy).toHaveBeenCalledTimes(1);
    });

    it('throws an error if value does not fit guard', async () => {
      @element(tag)
      class Test extends fixtureMixin(HTMLElement) {
        @property((v: any) => typeof v === 'number')
        public prop: any = 10;
      }

      const test = await fixture<Test>(`<${tag}></${tag}>`);

      expect(() => {
        test.prop = 'string';
      }).toThrow(new TypeError('Value applied to "prop" has wrong type'));
    });
  });
});
