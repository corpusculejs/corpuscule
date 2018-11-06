// tslint:disable:max-classes-per-file
import {state, stateChangedCallback} from '../../src';

class CorpusculeElementMock {
  public [stateChangedCallback](
    _key: PropertyKey,
    _oldValue: unknown,
    _newValue: unknown,
  ): void { // tslint:disable-line:no-empty
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

    it('runs [stateChangedCallback] on state property change', () => {
      const stateChangedCallbackSpy = jasmine.createSpy('onPropertyChanged');

      class Test extends CorpusculeElementMock {
        @state
        public prop: number = 10;

        public [stateChangedCallback](...args: Array<unknown>): void {
          stateChangedCallbackSpy(...args);
        }
      }

      const test = new Test();
      test.prop = 20;

      expect(stateChangedCallbackSpy).toHaveBeenCalledWith('prop', 10, 20);
      expect(stateChangedCallbackSpy).toHaveBeenCalledTimes(1);
    });
  });
};

export default testStateDecorator;
