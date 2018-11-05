// tslint:disable:max-classes-per-file
import {state, stateChangedCallback} from '../../src';
import {invalidate as $$invalidate} from '../../src/tokens/internal';

class CorpusculeElementMock {
  public [stateChangedCallback](
    _key: PropertyKey,
    _oldValue: unknown,
    _newValue: unknown,
  ): void { // tslint:disable-line:no-empty
  }

  // tslint:disable-next-line:no-empty
  public [$$invalidate](): void {
  }
}

const testStateDecorator = () => {
  describe('@state', () => {
    it('initializes, gets and sets state properties', () => {
      class Test extends CorpusculeElementMock {
        @state
        public prop: number = 10;
      }

      const test = new Test();

      expect(test.prop).toBe(10);

      test.prop = 20;

      expect(test.prop).toBe(20);
    });

    it('runs [stateChangedCallback] and [$$invalidate] on state property change', () => {
      const stateChangedCallbackSpy = jasmine.createSpy('onPropertyChanged');
      const invalidateSpy = jasmine.createSpy('onInvalidate');

      class Test extends CorpusculeElementMock {
        @state
        public prop: number = 10;

        public [stateChangedCallback](...args: Array<unknown>): void {
          stateChangedCallbackSpy(...args);
        }

        public [$$invalidate](): void {
          invalidateSpy();
        }
      }

      const test = new Test();
      test.prop = 20;

      expect(stateChangedCallbackSpy).toHaveBeenCalledWith('prop', 10, 20);
      expect(stateChangedCallbackSpy).toHaveBeenCalledTimes(1);
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
    });
  });
};

export default testStateDecorator;
