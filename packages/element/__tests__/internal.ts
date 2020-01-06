/* eslint-disable @typescript-eslint/no-empty-function, max-classes-per-file */
import {internal, internalChangedCallback} from '../src';

class CorpusculeElementMock {
  public [internalChangedCallback](
    _key: PropertyKey,
    _oldValue: unknown,
    _newValue: unknown,
  ): void {}
}

describe('@corpuscule/element', () => {
  describe('@internal', () => {
    it('initializes, gets and sets internal properties', () => {
      class Test extends CorpusculeElementMock {
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

      const test = new Test();

      expect(test.prop).toBe(10);
      expect(test.accessor).toBe('str');

      test.prop = 20;
      test.accessor = 'test';

      expect(test.prop).toBe(20);
      expect(test.accessor).toBe('test');
    });

    it('runs [internalChangedCallback] on internal property change', () => {
      const internalChangedCallbackSpy = jasmine.createSpy('onInternalChanged');

      class Test extends CorpusculeElementMock {
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

        public [internalChangedCallback](...args: unknown[]): void {
          internalChangedCallbackSpy(...args);
        }
      }

      const test = new Test();
      test.prop = 20;

      expect(internalChangedCallbackSpy).toHaveBeenCalledWith('prop', 10, 20);
      expect(internalChangedCallbackSpy).toHaveBeenCalledTimes(1);

      internalChangedCallbackSpy.calls.reset();

      test.accessor = 'test';
      expect(internalChangedCallbackSpy).toHaveBeenCalledWith(
        'accessor',
        'str',
        'test',
      );
      expect(internalChangedCallbackSpy).toHaveBeenCalledTimes(1);
    });

    it('runs [internalChangedCallback] after the property is set', () => {
      const internalChangedCallbackSpy = jasmine.createSpy('onInternalChanged');

      class Test extends CorpusculeElementMock {
        @internal
        public prop: number = 10;

        public [internalChangedCallback](
          _name: string,
          _oldValue: number,
          newValue: number,
        ): void {
          internalChangedCallbackSpy();
          expect(this.prop).toBe(newValue);
        }
      }

      const test = new Test();
      test.prop = 20;

      expect(internalChangedCallbackSpy).toHaveBeenCalledTimes(1);
    });
  });
});
