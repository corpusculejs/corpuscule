// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from 'lit-html';
import {html} from 'lit-html/lib/lit-extended';
// tslint:disable-next-line:no-implicit-dependencies
import uuid from 'uuid/v4';
import CorpusculeElement, {ComputedDescriptorMap} from '../../src';
import {registerAndMount} from '../utils';

const computed = () => {
  describe('computed', () => {
    it('should memoize result of processed getter', () => {
      const spy = jasmine.createSpy('OnComputed');

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _computed(): ComputedDescriptorMap<any> {
          return {
            comp: ['first', 'second'],
          };
        }

        public first: number = 1;

        public second: number = 2;

        public get comp(): number {
          spy();

          return this.first + this.second;
        }

        protected _render(): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      const el = registerAndMount(Test.is, Test);

      expect(el.comp).toBe(3);
      expect(el.comp).toBe(3);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should reset result on watching property change', () => {
      const spy = jasmine.createSpy('OnComputed');

      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _computed(): ComputedDescriptorMap<any> {
          return {
            comp: ['first', 'second'],
          };
        }

        public first: number = 1;

        public second: number = 2;

        public get comp(): number {
          spy();

          return this.first + this.second;
        }

        protected _render(): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      const el = registerAndMount(Test.is, Test);

      expect(el.comp).toBe(3);

      el.first = 0;
      el.second = 1;

      expect(el.comp).toBe(1);
      expect(el.comp).toBe(1);

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should throw an error if computed variable is not defined', () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _computed(): ComputedDescriptorMap<any> {
          return {
            comp: ['first', 'second'],
          };
        }

        public first: number = 1;

        public second: number = 2;

        protected _render(): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      expect(() => registerAndMount(Test.is, Test))
        .toThrowError('Property "comp" is not defined or is not a getter');
    });

    it('should throw an error if computed variable is not a getter', () => {
      class Test extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _computed(): ComputedDescriptorMap<any> {
          return {
            comp: ['first', 'second'],
          };
        }

        public first: number = 1;

        public second: number = 2;

        public comp(): number {
          return this.first + this.second;
        }

        protected _render(): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      expect(() => registerAndMount(Test.is, Test))
        .toThrowError('Property "comp" is not defined or is not a getter');
    });

    it('should allow to define property in any place of prototype chain', () => {
      class Parent extends CorpusculeElement {
        public static is: string = `x-${uuid()}`;

        protected static get _computed(): ComputedDescriptorMap<any> {
          return {
            comp: ['first'],
          };
        }

        public first: number = 1;

        public get comp(): number {
          return this.first + 2;
        }

        protected _render(): TemplateResult {
          return html`<span id="node">Test content</span>`;
        }
      }

      class Child extends Parent {}

      const el = registerAndMount(Child.is, Child);

      expect(el.comp).toBe(3);
    });
  });
};

export default computed;
