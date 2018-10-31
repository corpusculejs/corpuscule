// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from 'lit-html';
// tslint:disable-next-line:no-implicit-dependencies
import uuid from 'uuid/v4';
import {defineAndMount} from '../../../../test/utils';
import CorpusculeElement, {deriveStateFromProps, property, render, shouldUpdate, state} from '../../src';

const testDeriveStateFromProps = () => {
  describe('[deriveStateFromProps]', () => {
    let elementName: string;

    beforeEach(() => {
      elementName = `x-${uuid()}`;
    });

    it('should provide changed state for [shouldUpdate]', async () => {
      const shouldUpdateSpy = jasmine.createSpy('[shouldUpdate]');

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected static [deriveStateFromProps]({num}: Test): object | null {
          return {
            poweredNum: num ** 2,
          };
        }

        protected static [shouldUpdate](
          props: unknown,
          states: unknown,
          prevProps: unknown,
          prevStates: unknown,
        ): boolean {
          shouldUpdateSpy(props, states, prevProps, prevStates);

          return true;
        }

        @property() public num: number = 2;
        // @ts-ignore
        @state private poweredNum: number = 0;

        protected [render](): TemplateResult | null {
          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      el.num = 3;
      await el.elementRendering;

      expect(shouldUpdateSpy).toHaveBeenCalledWith(
        {num: 3},
        {poweredNum: 9},
        {num: 2},
        {poweredNum: 4},
      );
    });

    it('should provide changed state for [render]', async () => {
      const renderSpy = jasmine.createSpy('[renderSpy]');

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected static [deriveStateFromProps]({num}: Test): object | null {
          return {
            poweredNum: num ** 2,
          };
        }

        @property() public num: number = 2;
        @state private poweredNum: number = 0;

        protected [render](): TemplateResult | null {
          renderSpy(this.num, this.poweredNum);

          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      el.num = 3;
      await el.elementRendering;

      expect(renderSpy).toHaveBeenCalledWith(3, 9);
    });

    it('should be able to preserve previous state by returning null', async () => {
      const shouldUpdateSpy = jasmine.createSpy('[shouldUpdate]');

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected static [deriveStateFromProps](): null {
          return null;
        }

        protected static [shouldUpdate](
          _props: unknown,
          states: {readonly [key: string]: unknown},
          _prevProps: unknown,
          prevStates: {readonly [key: string]: unknown},
        ): boolean {
          shouldUpdateSpy();

          expect(Object.keys(states).length).toBe(Object.keys(prevStates).length);

          for (const key in states) { // tslint:disable-line:forin
            expect(states[key]).toBe(prevStates[key]);
          }

          return true;
        }

        @property() public num: number = 2;
        // @ts-ignore
        @state private poweredNum: number = 0;

        protected [render](): TemplateResult | null {
          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      el.num = 3;
      await el.elementRendering;

      expect(shouldUpdateSpy).toHaveBeenCalled();
    });

    it('should be able to return partial state', async () => {
      const shouldUpdateSpy = jasmine.createSpy('[shouldUpdate]');

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected static [deriveStateFromProps]({num}: Test): object | null {
          return {
            poweredNum: num ** 2,
          };
        }

        protected static [shouldUpdate](
          props: unknown,
          states: unknown,
          prevProps: unknown,
          prevStates: unknown,
        ): boolean {
          shouldUpdateSpy(props, states, prevProps, prevStates);

          return true;
        }

        @property() public num: number = 2;
        // @ts-ignore
        @state private poweredNum: number = 0;
        // @ts-ignore
        @state private zero: number = 0;

        protected [render](): TemplateResult | null {
          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      el.num = 3;
      await el.elementRendering;

      expect(shouldUpdateSpy).toHaveBeenCalledWith(
        {num: 3},
        {poweredNum: 9, zero: 0},
        {num: 2},
        {poweredNum: 4, zero: 0},
      );
    });
  });
};

export default testDeriveStateFromProps;
