// tslint:disable:max-classes-per-file
// tslint:disable-next-line:no-implicit-dependencies
import uuid from 'uuid/v4';
import createContext, {value} from '../src';
import {consume, consumers} from '../src/tokens/internal';
import {BaseConsumer, BaseProvider, registerAndMount} from './utils';

describe('@corpuscule/context', () => {
  describe('createContext', () => {
    it('should create context', () => {
      const {provider, consumer} = createContext();

      @provider
      class TestProvider extends BaseProvider {
        public static readonly is: string = `x-${uuid()}`;

        protected [value]: number = 2;
      }

      @consumer
      class TestConsumer extends BaseConsumer {
        public static readonly is: string = `x-${uuid()}`;

        protected [value]?: number;
      }

      const [, c] = registerAndMount(
        [TestProvider.is, TestProvider],
        [TestConsumer.is, TestConsumer],
      );

      expect(c[value]).toBe(2);
    });

    it('should provide context for all consumers', () => {
      const {provider, consumer} = createContext();

      @provider
      class TestProvider extends BaseProvider {
        public static readonly is: string = `x-${uuid()}`;

        protected [value]: number = 2;
      }

      @consumer
      class TestConsumer1 extends BaseConsumer {
        public static readonly is: string = `x-${uuid()}`;

        protected [value]?: number;
      }

      @consumer
      class TestConsumer2 extends BaseConsumer {
        public static readonly is: string = `x-${uuid()}`;

        protected [value]?: number;
      }

      const [, c1, c2] = registerAndMount(
        [TestProvider.is, TestProvider],
        [TestConsumer1.is, TestConsumer1],
        [TestConsumer2.is, TestConsumer2],
      );

      expect(c1[value]).toBe(2);
      expect(c2[value]).toBe(2);
    });

    it('should allow to use default value for context', () => {
      const {provider, consumer} = createContext(5);

      @provider
      class TestProvider extends BaseProvider {
        public static readonly is: string = `x-${uuid()}`;
      }

      @consumer
      class TestConsumer extends BaseConsumer {
        public static readonly is: string = `x-${uuid()}`;

        protected [value]?: number;
      }

      const [, c] = registerAndMount(
        [TestProvider.is, TestProvider],
        [TestConsumer.is, TestConsumer],
      );

      expect(c[value]).toBe(5);
    });

    it('should allow to set value dynamically', () => {
      const {provider, consumer} = createContext();

      @provider
      class TestProvider extends BaseProvider {
        public static readonly is: string = `x-${uuid()}`;

        protected [value]: number = 2;
      }

      @consumer
      class TestConsumer extends BaseConsumer {
        public static readonly is: string = `x-${uuid()}`;

        protected [value]?: number;
      }

      const [p, c] = registerAndMount(
        [TestProvider.is, TestProvider],
        [TestConsumer.is, TestConsumer],
      );

      expect(c[value]).toBe(2);

      p[value] = 5;

      expect(c[value]).toBe(5);
    });

    it('should call connectedCallback() and disconnectedCallback() of user\'s class', () => {
      const connectedSpy = jasmine.createSpy('onConnect');
      const disconnectedSpy = jasmine.createSpy('onDisconnect');
      const {provider, consumer} = createContext();

      @provider
      class TestProvider extends BaseProvider {
        public static readonly is: string = `x-${uuid()}`;

        protected [value]: number = 2;

        public connectedCallback(): void {
          connectedSpy();
          super.connectedCallback();
        }

        public disconnectedCallback(): void {
          disconnectedSpy();
        }
      }

      @consumer
      class TestConsumer extends BaseConsumer {
        public static readonly is: string = `x-${uuid()}`;

        protected [value]?: number;

        public connectedCallback(): void {
          connectedSpy();
        }

        public disconnectedCallback(): void {
          disconnectedSpy();
        }
      }

      const [p] = registerAndMount(
        [TestProvider.is, TestProvider],
        [TestConsumer.is, TestConsumer],
      );

      document.body.removeChild(p);

      expect(connectedSpy).toHaveBeenCalledTimes(2);
      expect(disconnectedSpy).toHaveBeenCalledTimes(2);
    });

    it('should stop providing value to disconnected consumers', () => {
      const {provider, consumer} = createContext();

      @provider
      class TestProvider extends BaseProvider {
        public static readonly is: string = `x-${uuid()}`;

        protected [value]: number = 2;
      }

      @consumer
      class TestConsumer1 extends BaseConsumer {
        public static readonly is: string = `x-${uuid()}`;

        protected [value]?: number;
      }

      @consumer
      class TestConsumer2 extends BaseConsumer {
        public static readonly is: string = `x-${uuid()}`;

        protected [value]?: number;
      }

      const [p, c1, c2] = registerAndMount(
        [TestProvider.is, TestProvider],
        [TestConsumer1.is, TestConsumer1],
        [TestConsumer2.is, TestConsumer2],
      );

      expect((p as any)[consumers]).toEqual([(c1 as any)[consume], (c2 as any)[consume]]);

      c1.remove();

      expect((p as any)[consumers]).toEqual([(c2 as any)[consume]]);
    });
  });
});
