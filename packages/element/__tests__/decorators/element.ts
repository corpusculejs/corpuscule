// tslint:disable:no-unnecessary-class max-classes-per-file no-unbound-method
import {element} from '../../src';

const testElementDecorator = () => {
  describe('@element', () => {
    beforeEach(() => {
      spyOn(customElements, 'define');
    });

    it('adds element to a custom elements registry', () => {
      @element('x-test')
      class Test {
      }

      expect(customElements.define).toHaveBeenCalledWith('x-test', Test);
    });

    it('adds "is" readonly field with name to element', () => {
      @element('x-test')
      class Test {
        public static readonly is: string;
      }

      expect(Test.is).toBe('x-test');
    });
  });
};

export default testElementDecorator;
