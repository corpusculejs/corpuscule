// tslint:disable:max-classes-per-file

import {ComputingPair, createComputingPair} from '../../src';

const repeatGetTenTimes = <C extends object, M extends keyof C, T extends C[M]>(instance: C, method: M): T => {
  let res: any;

  for (let i = 0; i < 10; i++) { // tslint:disable-line:no-increment-decrement
    res = instance[method];
  }

  return res;
};

const testComputingPair = () => {
  describe('createComputingPair', () => {
    let c: ComputingPair;

    beforeEach(() => {
      c = createComputingPair();
    });

    it('memoizes getter result', () => {
      const spy = jasmine.createSpy('onCompute');

      class Test {
        @c.observer
        public observed1: string = 'str';

        @c.observer
        public observed2: number = 10;

        @c.computer
        public get computed(): string {
          spy();

          return `${this.observed2} of ${this.observed1}`;
        }
      }

      const test = new Test();

      expect(repeatGetTenTimes(test, 'computed')).toBe('10 of str');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('marks getter for recomputation if observed property is changed', () => {
      const spy = jasmine.createSpy('onCompute');

      class Test {
        @c.observer
        public observed1: string = 'str';

        @c.observer
        public observed2: number = 10;

        @c.computer
        public get computed(): string {
          spy();

          return `${this.observed2} of ${this.observed1}`;
        }
      }

      const test = new Test();

      repeatGetTenTimes(test, 'computed');

      test.observed2 = 20;

      expect(repeatGetTenTimes(test, 'computed')).toBe('20 of str');
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('works with getters and setters', () => {
      const spy = jasmine.createSpy('onCompute');

      class Test {
        @c.observer
        public observed1: string = 'str';

        @c.observer
        public get observed2(): number {
          return this.secret;
        }

        public set observed2(v: number) {
          this.secret = v;
        }

        private secret: number = 10;

        @c.computer
        public get computed(): string {
          spy();

          return `${this.observed2} of ${this.observed1}`;
        }
      }

      const test = new Test();

      expect(repeatGetTenTimes(test, 'computed')).toBe('10 of str');

      test.observed2 = 20;

      expect(repeatGetTenTimes(test, 'computed')).toBe('20 of str');
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('can be used multiple times', () => {
      const spy1 = jasmine.createSpy('onCompute1');
      const spy2 = jasmine.createSpy('onCompute2');

      class Test {
        @c.observer
        public observed: string = 'str';

        @c.computer
        public get computed1(): string {
          spy1();

          return `foo: ${this.observed}`;
        }

        @c.computer
        public get computed2(): string {
          spy2();

          return `bar: ${this.observed}`;
        }
      }

      const test = new Test();

      expect(repeatGetTenTimes(test, 'computed1')).toBe('foo: str');
      expect(repeatGetTenTimes(test, 'computed2')).toBe('bar: str');
      expect(spy1).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledTimes(1);
    });
  });
};

export default testComputingPair;
