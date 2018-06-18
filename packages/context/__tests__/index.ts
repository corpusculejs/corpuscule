// tslint:disable:max-classes-per-file
// tslint:disable-next-line:no-implicit-dependencies
import uuid from "uuid/v4";
import {BasicConsumer, BasicProvider, defineAndMountContext} from "../../../test/utils";
import createContext from "../src";

describe("@corpuscule/context", () => {
  afterEach(() => {
    document.body.innerHTML = ""; // tslint:disable-line:no-inner-html
  });

  describe("createContext", () => {
    it("should create context", () => {
      const {
        consumer,
        contextValue,
        provider,
        providingValue,
      } = createContext();

      class TestProvider extends provider(BasicProvider) {
        public static readonly is: string = `x-${uuid()}`;

        protected [providingValue]: number = 2;
      }

      class TestConsumer extends consumer(BasicConsumer) {
        public static readonly is: string = `x-${uuid()}`;

        protected [contextValue]?: number;
      }

      const [, c] = defineAndMountContext(TestProvider, TestConsumer);

      expect(c[contextValue]).toBe(2);
    });

    it("should provide context for all consumers", () => {
      const {
        consumer,
        contextValue,
        provider,
        providingValue,
      } = createContext();

      class TestProvider extends provider(BasicProvider) {
        public static readonly is: string = `x-${uuid()}`;

        protected [providingValue]: number = 2;
      }

      class TestConsumer1 extends consumer(BasicConsumer) {
        public static readonly is: string = `x-${uuid()}`;

        protected [contextValue]?: number;
      }

      class TestConsumer2 extends consumer(BasicConsumer) {
        public static readonly is: string = `x-${uuid()}`;

        protected [contextValue]?: number;
      }

      const [, c1, c2] = defineAndMountContext(TestProvider, TestConsumer1, TestConsumer2);

      expect(c1[contextValue]).toBe(2);
      expect(c2[contextValue]).toBe(2);
    });

    it("should allow to use default value for context", () => {
      const {
        consumer,
        contextValue,
        provider,
      } = createContext(5);

      class TestProvider extends provider(BasicProvider) {
        public static readonly is: string = `x-${uuid()}`;
      }

      class TestConsumer extends consumer(BasicConsumer) {
        public static readonly is: string = `x-${uuid()}`;

        protected [contextValue]?: number;
      }

      const [, c] = defineAndMountContext(TestProvider, TestConsumer);

      expect(c[contextValue]).toBe(5);
    });

    it("should allow to set value dynamically", () => {
      const {
        consumer,
        contextValue,
        provider,
        providingValue,
      } = createContext();

      class TestProvider extends provider(BasicProvider) {
        public static readonly is: string = `x-${uuid()}`;

        protected [providingValue]: number = 2;
      }

      class TestConsumer extends consumer(BasicConsumer) {
        public static readonly is: string = `x-${uuid()}`;

        protected [contextValue]?: number;
      }

      const [p, c] = defineAndMountContext(TestProvider, TestConsumer);

      expect(c[contextValue]).toBe(2);

      p[providingValue] = 5;

      expect(c[contextValue]).toBe(5);
    });

    it("should call connectedCallback() and disconnectedCallback() of user's class", () => {
      const connectedSpy = jasmine.createSpy("onConnect");
      const disconnectedSpy = jasmine.createSpy("onDisconnect");
      const {
        consumer,
        contextValue,
        provider,
        providingValue,
      } = createContext();

      class TestProvider extends provider(BasicProvider) {
        public static readonly is: string = `x-${uuid()}`;

        protected [providingValue]: number = 2;

        public connectedCallback(): void {
          connectedSpy();
          super.connectedCallback();
        }

        public disconnectedCallback(): void {
          disconnectedSpy();
        }
      }

      class TestConsumer extends consumer(BasicConsumer) {
        public static readonly is: string = `x-${uuid()}`;

        protected [contextValue]?: number;

        public connectedCallback(): void {
          connectedSpy();
        }

        public disconnectedCallback(): void {
          disconnectedSpy();
        }
      }

      const [p] = defineAndMountContext(TestProvider, TestConsumer);

      document.body.removeChild(p);

      expect(connectedSpy).toHaveBeenCalledTimes(2);
      expect(disconnectedSpy).toHaveBeenCalledTimes(2);
    });

    it("should stop providing value to disconnected consumers", () => {
      const {
        consumer,
        contextValue,
        provider,
        providingValue,
      } = createContext();

      class TestProvider extends provider(BasicProvider) {
        public static readonly is: string = `x-${uuid()}`;

        protected [providingValue]: number = 2;
      }

      class TestConsumer1 extends consumer(BasicConsumer) {
        public static readonly is: string = `x-${uuid()}`;

        protected [contextValue]?: number;
      }

      class TestConsumer2 extends consumer(BasicConsumer) {
        public static readonly is: string = `x-${uuid()}`;

        protected [contextValue]?: number;
      }

      const [p, c1, c2] = defineAndMountContext(TestProvider, TestConsumer1, TestConsumer2);

      expect(c1[contextValue]).toBe(2);
      expect(c2[contextValue]).toBe(2);

      c1.remove();
      p[providingValue] = 3;

      expect(c2[contextValue]).toBe(3);
      expect(c1[contextValue]).toBe(2);
    });
    // it("should throw an error if no provider exists for context", () => {
    //   const {
    //     consumer,
    //     contextValue,
    //   } = createContext();
    //
    //   class TestConsumer extends consumer(HTMLElement) {
    //     public static readonly is: string = `x-${uuid()}`;
    //
    //     public [contextValue]?: number;
    //   }
    //
    //   customElements.define(TestConsumer.is, TestConsumer);
    //   const el = document.createElement(TestConsumer.is);
    //   expect(() => {
    //     document.body.appendChild(el);
    //   }).toThrowError("No provider found for TestConsumer");
    // });
  });
});
