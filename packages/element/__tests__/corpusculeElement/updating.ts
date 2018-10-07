// tslint:disable:await-promise max-classes-per-file
import {html, TemplateResult} from "lit-html";
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {defineAndMount} from "../../../../test/utils";
import CorpusculeElement, {
  attribute,
  deriveStateFromProps,
  didMount, didUpdate,
  property,
  render,
  shouldUpdate,
  state
} from "../../src";

const testUpdating = () => {
  describe("updating stage", () => {
    let elementName: string;

    beforeEach(() => {
      elementName = `x-${uuid()}`;
    });

    it("should call [deriveStateFromProps] on attribute/property update", async () => {
      const deriveStateFromPropsSpy = jasmine.createSpy("[deriveStateFromProps]");

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected static [deriveStateFromProps](props: unknown, states: unknown): null {
          deriveStateFromPropsSpy(props, states);

          return null;
        }

        @attribute("str", String) public str: string = "";
        @property() public num: number = 0;

        protected [render](): TemplateResult | null {
          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      el.setAttribute("str", "test string");
      await el.elementRendering;

      expect(deriveStateFromPropsSpy).toHaveBeenCalledTimes(2);
      expect(deriveStateFromPropsSpy).toHaveBeenCalledWith({str: "test string", num: 0}, {});

      el.num = 10;
      await el.elementRendering;

      expect(deriveStateFromPropsSpy).toHaveBeenCalledTimes(3);
      expect(deriveStateFromPropsSpy).toHaveBeenCalledWith({str: "test string", num: 10}, {});
    });

    it("should call [deriveStateFromProps] on state update", async () => {
      const deriveStateFromPropsSpy = jasmine.createSpy("[deriveStateFromProps]");

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected static [deriveStateFromProps](props: unknown, states: unknown): null {
          deriveStateFromPropsSpy(props, states);

          return null;
        }

        // @ts-ignore
        @state private str: string = "";

        public setStr(value: string): void {
          this.str = value;
        }

        protected [render](): TemplateResult | null {
          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      el.setStr("test string");
      await el.elementRendering;

      expect(deriveStateFromPropsSpy).toHaveBeenCalledTimes(2);
      expect(deriveStateFromPropsSpy).toHaveBeenCalledWith({}, {str: "test string"});
    });

    it("should call [shouldUpdate] on attribute/property update", async () => {
      const shouldUpdateSpy = jasmine.createSpy("[shouldUpdate]");
      let isMount = false;

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected static [shouldUpdate](
          props: unknown,
          states: unknown,
          prevProps: unknown,
          prevStates: unknown,
        ): boolean {
          shouldUpdateSpy(props, states, prevProps, prevStates);

          return true;
        }

        @attribute("str", String) public str: string = "";
        @property() public num: number = 0;

        protected [didMount](): void {
          isMount = true;
        }

        protected [render](): TemplateResult | null {
          if (isMount) {
            expect(shouldUpdateSpy).toHaveBeenCalled();
          }

          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      el.setAttribute("str", "test string");
      await el.elementRendering;

      expect(shouldUpdateSpy).toHaveBeenCalledTimes(1);
      expect(shouldUpdateSpy).toHaveBeenCalledWith(
        {str: "test string", num: 0},
        {},
        {str: "", num: 0},
        {},
      );

      el.num = 10;
      await el.elementRendering;

      expect(shouldUpdateSpy).toHaveBeenCalledTimes(2);
      expect(shouldUpdateSpy).toHaveBeenCalledWith(
        {str: "test string", num: 10},
        {},
        {str: "test string", num: 0},
        {},
      );
    });

    it("should call [shouldUpdate] on state update", async () => {
      const shouldUpdateSpy = jasmine.createSpy("[shouldUpdate]");
      let isMount = false;

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected static [shouldUpdate](
          props: unknown,
          states: unknown,
          prevProps: unknown,
          prevStates: unknown,
        ): boolean {
          shouldUpdateSpy(props, states, prevProps, prevStates);

          return true;
        }

        // @ts-ignore
        @state private num: number = 0;

        public setNum(value: number): void {
          this.num = value;
        }

        protected [didMount](): void {
          isMount = true;
        }

        protected [render](): TemplateResult | null {
          if (isMount) {
            expect(shouldUpdateSpy).toHaveBeenCalled();
          }

          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      el.setNum(10);
      await el.elementRendering;

      expect(shouldUpdateSpy).toHaveBeenCalledTimes(1);
      expect(shouldUpdateSpy).toHaveBeenCalledWith(
        {},
        {num: 10},
        {},
        {num: 0},
      );
    });

    it("should render on attribute/property/state changes", async () => {
      const renderSpy = jasmine.createSpy("[render]");

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        @attribute("str", String) public str: string = "start";
        @property() public num: number = 10;
        @state private bool: boolean = false;

        public setBool(value: boolean): void {
          this.bool = value;
        }

        protected [render](): TemplateResult | null {
          renderSpy();

          return html`<div>${this.str}, ${this.num}, ${this.bool}</div>`;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;
      expect(el.shadowRoot!.textContent).toContain("start, 10, false");

      el.setAttribute("str", "test string");
      await el.elementRendering;
      expect(el.shadowRoot!.textContent).toContain("test string, 10, false");

      el.num = 20;
      await el.elementRendering;
      expect(el.shadowRoot!.textContent).toContain("test string, 20, false");

      el.setBool(true);
      await el.elementRendering;
      expect(el.shadowRoot!.textContent).toContain("test string, 20, true");

      expect(renderSpy).toHaveBeenCalledTimes(4);
    });

    it("should call [didUpdate] after render is completed", async () => {
      const didUpdateSpy = jasmine.createSpy("[didUpdate]");

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        @attribute("str", String) public str: string = "start";
        @property() public num: number = 10;
        // @ts-ignore
        @state private bool: boolean = false;

        public setBool(value: boolean): void {
          this.bool = value;
        }

        protected [didUpdate](prevProps: unknown, prevStates: unknown): void {
          didUpdateSpy(prevProps, prevStates);
        }

        protected [render](): TemplateResult | null {
          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      el.setAttribute("str", "test string");
      await el.elementRendering;
      expect(didUpdateSpy).toHaveBeenCalledWith(
        {str: "start", num: 10},
        {bool: false},
      );

      el.num = 20;
      await el.elementRendering;
      expect(didUpdateSpy).toHaveBeenCalledWith(
        {str: "test string", num: 10},
        {bool: false},
      );

      el.setBool(true);
      await el.elementRendering;
      expect(didUpdateSpy).toHaveBeenCalledWith(
        {str: "test string", num: 20},
        {bool: false},
      );

      el.setBool(false);
      await el.elementRendering;
      expect(didUpdateSpy).toHaveBeenCalledWith(
        {str: "test string", num: 20},
        {bool: true},
      );
    });

    it("should start new re-rendering cycle if [didUpdate] changes state", async () => {
      const didUpdateSpy = jasmine.createSpy("[didUpdate]");
      const renderSpy = jasmine.createSpy("[render]");

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        @state private bool: boolean = false;

        public setBool(value: boolean): void {
          this.bool = value;
        }

        protected [didUpdate](props: unknown, states: this): void {
          didUpdateSpy(props, states);

          if (this.bool && !states.bool) {
            this.bool = false;
          }
        }

        protected [render](): TemplateResult | null {
          renderSpy();

          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      el.setBool(true);
      await el.elementRendering;
      await el.elementRendering;

      expect(didUpdateSpy).toHaveBeenCalledTimes(2);
      expect(renderSpy).toHaveBeenCalledTimes(3);
    });

    it("should not render except mounting stage if [shouldUpdate] returns false", async () => {
      const renderSpy = jasmine.createSpy("[render]");

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected static [shouldUpdate](): boolean {
          return false;
        }

        @property() public num: number = 10;

        protected [render](): TemplateResult | null {
          renderSpy();

          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      el.num = 20;
      await el.elementRendering;

      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it("should avoid calling [didUpdate] if [shouldUpdate] returns false", async () => {
      const didUpdateSpy = jasmine.createSpy("[didUpdate]");

      class Test extends CorpusculeElement {
        public static readonly is: string = elementName;

        protected static [shouldUpdate](): boolean {
          return false;
        }

        @property() public num: number = 10;

        protected [didUpdate](): void {
          didUpdateSpy();
        }

        protected [render](): TemplateResult | null {
          return null;
        }
      }

      const el = defineAndMount(Test);
      await el.elementRendering;

      el.num = 20;
      await el.elementRendering;

      expect(didUpdateSpy).not.toHaveBeenCalled();
    });
  });
};

export default testUpdating;
