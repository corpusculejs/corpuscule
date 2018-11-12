// tslint:disable:max-classes-per-file
import {internal, internalChangedCallback} from '../../src';

class CorpusculeElementMock {
  public [internalChangedCallback](
    _key: PropertyKey,
    _oldValue: unknown,
    _newValue: unknown,
  ): void { // tslint:disable-line:no-empty
  }
}

const testInternalDecorator = () => {
  describe('@internal', () => {
    it('initializes, gets and sets internal properties', () => {
      class Test extends CorpusculeElementMock {
        @internal
        public prop: number = 10;
      }

      const test = new Test();

      expect(test.prop).toBe(10);

      test.prop = 20;

      expect(test.prop).toBe(20);
    });

    it('runs [internalChangedCallback] on internal property change', () => {
      const internalChangedCallbackSpy = jasmine.createSpy('onInternalChanged');

      class Test extends CorpusculeElementMock {
        @internal
        public prop: number = 10;

        public [internalChangedCallback](...args: Array<unknown>): void {
          internalChangedCallbackSpy(...args);
        }
      }

      const test = new Test();
      test.prop = 20;

      expect(internalChangedCallbackSpy).toHaveBeenCalledWith('prop', 10, 20);
      expect(internalChangedCallbackSpy).toHaveBeenCalledTimes(1);
    });
  });
};

export default testInternalDecorator;
