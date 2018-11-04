// tslint:disable:max-classes-per-file
import {state, stateChangedCallback} from '../../src';
import {invalidate as $$invalidate} from '../../src/tokens/internal';

const testStateDecorator = () => {
  describe('@state', () => {
    let stateChangedCallbackSpy: jasmine.Spy;
    let invalidateSpy: jasmine.Spy;
    let CorpusculeElementMock: any; // tslint:disable-line:naming-convention

    beforeEach(() => {
      stateChangedCallbackSpy = jasmine.createSpy('onPropertyChanged');
      invalidateSpy = jasmine.createSpy('onInvalidate');

      CorpusculeElementMock = class {
        public [stateChangedCallback](
          key: PropertyKey,
          oldValue: unknown,
          newValue: unknown,
        ): void {
          stateChangedCallbackSpy(key, oldValue, newValue);
        }

        public [$$invalidate](): void {
          invalidateSpy();
        }
      };
    });

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
      class Test extends CorpusculeElementMock {
        @state
        public prop: number = 10;
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
