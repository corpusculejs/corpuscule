// tslint:disable:await-promise max-classes-per-file
import createComputingEntanglement, {ComputingEntanglement} from '../src/computed';

const testCreateComputingEntanglement = () => {
  describe('createComputingEntanglement', () => {
    let comp: ComputingEntanglement;

    beforeEach(() => {
      comp = createComputingEntanglement();
    });

    it('should memoize result of processed getter', async () => {
      const spy = jasmine.createSpy('OnComputed');

      class Test {
        @comp.observe
        public first: number = 1;

        @comp.observe
        public second: number = 2;

        @comp.computed
        public get comp(): number {
          spy();

          return this.first + this.second;
        }
      }

      const test = new Test();

      expect(test.comp).toBe(3);
      expect(test.comp).toBe(3);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should reset result on watching property change', async () => {
      const spy = jasmine.createSpy('OnComputed');

      class Test {
        @comp.observe
        public first: number = 1;

        @comp.observe
        public second: number = 2;

        @comp.computed
        public get comp(): number {
          spy();

          return this.first + this.second;
        }
      }

      const test = new Test();

      expect(test.comp).toBe(3);

      test.first = 0;
      test.second = 1;

      expect(test.comp).toBe(1);
      expect(test.comp).toBe(1);

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should work with getters', async () => {
      const spy = jasmine.createSpy('OnComputed');

      class Test {
        @comp.observe
        public first: number = 1;

        @comp.observe
        public get second(): number {
          return 2;
        }

        @comp.computed
        public get comp(): number {
          spy();

          return this.first + this.second;
        }
      }

      const test = new Test();

      expect(test.comp).toBe(3);

      test.first = 0;

      expect(test.comp).toBe(2);
      expect(test.comp).toBe(2);

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should work with crossing observers', async () => {
      const comp2 = createComputingEntanglement();

      const spy1 = jasmine.createSpy('OnComputed1');
      const spy2 = jasmine.createSpy('OnComputed2');

      class Test {
        @comp.observe
        @comp2.observe
        public first: number = 1;

        @comp.observe
        public get second(): number {
          return 2;
        }

        @comp.computed
        public get comp(): number {
          spy1();

          return this.first + this.second;
        }

        @comp2.computed
        public get comp2(): number {
          spy2();

          return this.first + 20;
        }
      }

      const test = new Test();

      expect(test.comp).toBe(3);
      expect(test.comp2).toBe(21);
      expect(test.comp2).toBe(21);

      test.first = 0;

      expect(test.comp).toBe(2);
      expect(test.comp).toBe(2);
      expect(test.comp2).toBe(20);
      expect(test.comp2).toBe(20);

      expect(spy1).toHaveBeenCalledTimes(2);
      expect(spy2).toHaveBeenCalledTimes(2);
    });
  });
};

export default testCreateComputingEntanglement;
