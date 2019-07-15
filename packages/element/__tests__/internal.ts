// tslint:disable:max-classes-per-file
import {fixture} from '@open-wc/testing-helpers/src/fixture-no-side-effect';
import {genName} from '../../../test/utils';
import {element, gear, internal} from '../src';
import {fixtureMixin} from './utils';

describe('@corpuscule/element', () => {
  describe('@internal', () => {
    let tag: string;

    beforeEach(() => {
      tag = genName();
    });

    it('initializes, gets and sets internal properties', async () => {
      @element(tag)
      class Test extends HTMLElement {
        @internal
        public prop: number = 10;

        @internal
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

    it('runs internalChangedCallback on internal property change', async () => {
      const internalChangedCallbackSpy = jasmine.createSpy('onInternalChanged');

      @element(tag)
      class Test extends fixtureMixin(HTMLElement) {
        @internal
        public prop: number = 10;

        @internal
        public get accessor(): string {
          return this.storage;
        }

        public set accessor(v: string) {
          this.storage = v;
        }

        private storage: string = 'str';

        @gear()
        public internalChangedCallback(...args: unknown[]): void {
          internalChangedCallbackSpy(...args);
        }
      }

      const test = await fixture<Test>(`<${tag}></${tag}>`);

      test.prop = 20;

      expect(internalChangedCallbackSpy).toHaveBeenCalledWith('prop', 10, 20);
      expect(internalChangedCallbackSpy).toHaveBeenCalledTimes(1);

      internalChangedCallbackSpy.calls.reset();

      test.accessor = 'test';
      expect(internalChangedCallbackSpy).toHaveBeenCalledWith('accessor', 'str', 'test');
      expect(internalChangedCallbackSpy).toHaveBeenCalledTimes(1);
    });
  });
});
