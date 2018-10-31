// tslint:disable:await-promise max-classes-per-file
import {TemplateResult} from 'lit-html';
// tslint:disable-next-line:no-implicit-dependencies
import uuid from 'uuid/v4';
import {defineAndMount} from '../../../../test/utils';
import CorpusculeElement, {
  deriveStateFromProps,
  didMount,
  didUpdate,
  render,
  shouldUpdate,
  state,
} from '../../src';

const testMounting = () => {
  describe('mounting stage', () => {
    let elementName: string;

    beforeEach(() => {
      elementName = `x-${uuid()}`;
    });

    it('should call [deriveStateFromProps] after constructor', async () => {
      const constructorSpy = jasmine.createSpy('constructor');
      const deriveStateFromPropsSpy = jasmine.createSpy('[deriveStateFromProps]');

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected static [deriveStateFromProps](props: unknown, states: unknown): null {
          deriveStateFromPropsSpy(props, states);
          expect(constructorSpy).toHaveBeenCalled();

          return null;
        }

        public constructor() {
          super();

          constructorSpy();
        }

        protected [render](): TemplateResult | null {
          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      expect(deriveStateFromPropsSpy).toHaveBeenCalled();
      expect(deriveStateFromPropsSpy).toHaveBeenCalledWith({}, {});
    });

    it('should skip calling [shouldUpdate] during mounting stage', async () => {
      const shouldUpdateSpy = jasmine.createSpy('[shouldUpdate]');

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected static [shouldUpdate](): boolean {
          shouldUpdateSpy();

          return true;
        }

        protected [render](): TemplateResult | null {
          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      expect(shouldUpdateSpy).not.toHaveBeenCalled();
    });

    it('should render on the mounting', async () => {
      const renderSpy = jasmine.createSpy('[render]');

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected [render](): TemplateResult | null {
          renderSpy();

          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      expect(renderSpy).toHaveBeenCalled();
    });

    it('should call [didMount] on mounting', async () => {
      const renderSpy = jasmine.createSpy('[render]');
      const didMountSpy = jasmine.createSpy('[didMount]');

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected [didMount](): void {
          expect(renderSpy).toHaveBeenCalled();
          didMountSpy();
        }

        protected [render](): TemplateResult | null {
          renderSpy();

          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      expect(didMountSpy).toHaveBeenCalled();
    });

    it('should start new re-rendering cycle if [didMount] changes state', async () => {
      const renderSpy = jasmine.createSpy('[render]');
      const didMountSpy = jasmine.createSpy('[didMount]');
      const didUpdateSpy = jasmine.createSpy('[didUpdate]');

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        // @ts-ignore
        @state private state: number = 10;

        protected [didMount](): void {
          didMountSpy();

          this.state = 20;
        }

        protected [didUpdate](): void {
          didUpdateSpy();
        }

        protected [render](): TemplateResult | null {
          renderSpy();

          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;
      await el.elementRendering;

      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(didMountSpy).toHaveBeenCalledTimes(1);
      expect(didUpdateSpy).toHaveBeenCalledTimes(1);
    });

    it('should avoid calling [didUpdate] during mounting', async () => {
      const didUpdateSpy = jasmine.createSpy('[didMount]');

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected [didUpdate](): void {
          didUpdateSpy();
        }

        protected [render](): TemplateResult | null {
          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      expect(didUpdateSpy).not.toHaveBeenCalled();
    });
  });
};

export default testMounting;
