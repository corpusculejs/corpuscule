// tslint:disable:max-classes-per-file
// tslint:disable-next-line:no-implicit-dependencies
import {HTMLElementMock} from '../../../test/utils';
import createContext from '../src';

describe('@corpuscule/context', () => {
  describe('createContext', () => {
    it('should create context', () => {
      const {
        consumer,
        contextValue,
        provider,
        providingValue,
      } = createContext();

      @provider
      class Provider extends HTMLElementMock {
        public [providingValue]: number = 2;
      }

      @consumer
      class Consumer extends HTMLElementMock {
        public [contextValue]: number;
      }

      const providerElement = new Provider();
      const consumerElement = new Consumer();

      consumerElement.addParent(providerElement);

      providerElement.connectedCallback();
      consumerElement.connectedCallback();
      expect(consumerElement[contextValue]).toBe(2);
    });

    it('should provide context for all consumers', () => {
      const {
        consumer,
        contextValue,
        provider,
        providingValue,
      } = createContext();

      @provider
      class Provider extends HTMLElementMock {
        public [providingValue]: number = 2;
      }

      @consumer
      class Consumer extends HTMLElementMock {
        public [contextValue]: number;
      }

      const providerElement = new Provider();
      const consumerElement1 = new Consumer();
      const consumerElement2 = new Consumer();

      consumerElement1.addParent(providerElement);
      consumerElement2.addParent(providerElement);

      providerElement.connectedCallback();
      consumerElement1.connectedCallback();
      consumerElement2.connectedCallback();

      expect(consumerElement1[contextValue]).toBe(2);
      expect(consumerElement2[contextValue]).toBe(2);
    });

    it('should allow to use default value for context', () => {
      const {
        consumer,
        contextValue,
        provider,
        providingValue,
      } = createContext(2);

      @provider
      class Provider extends HTMLElementMock {
        public [providingValue]: number;
      }

      @consumer
      class Consumer extends HTMLElementMock {
        public [contextValue]: number;
      }

      const providerElement = new Provider();
      const consumerElement = new Consumer();

      consumerElement.addParent(providerElement);

      providerElement.connectedCallback();
      consumerElement.connectedCallback();

      expect(providerElement[providingValue]).toBe(2);
      expect(consumerElement[contextValue]).toBe(2);
    });

    it('should allow to set value dynamically', () => {
      const {
        consumer,
        contextValue,
        provider,
        providingValue,
      } = createContext(2);

      @provider
      class Provider extends HTMLElementMock {
        public [providingValue]: number;
      }

      @consumer
      class Consumer extends HTMLElementMock {
        public [contextValue]: number;
      }

      const providerElement = new Provider();
      const consumerElement = new Consumer();

      consumerElement.addParent(providerElement);

      providerElement.connectedCallback();
      consumerElement.connectedCallback();

      providerElement[providingValue] = 10;

      expect(consumerElement[contextValue]).toBe(10);
    });

    it('should call connectedCallback() and disconnectedCallback() of user\'s class', () => {
      const connectedSpy = jasmine.createSpy('onConnect');
      const disconnectedSpy = jasmine.createSpy('onDisconnect');
      const {
        consumer,
        contextValue,
        provider,
        providingValue,
      } = createContext();

      @provider
      class Provider extends HTMLElementMock {
        public [providingValue]: number;

        public connectedCallback(): void {
          connectedSpy();
        }

        public disconnectedCallback(): void {
          disconnectedSpy();
        }
      }

      @consumer
      class Consumer extends HTMLElementMock {
        public [contextValue]: number;

        public connectedCallback(): void {
          connectedSpy();
        }

        public disconnectedCallback(): void {
          disconnectedSpy();
        }
      }

      const providerElement = new Provider();
      const consumerElement = new Consumer();

      consumerElement.addParent(providerElement);

      providerElement.connectedCallback();
      consumerElement.connectedCallback();

      providerElement.disconnectedCallback();
      consumerElement.disconnectedCallback();

      expect(connectedSpy).toHaveBeenCalledTimes(2);
      expect(disconnectedSpy).toHaveBeenCalledTimes(2);
    });

    it('should stop providing value to disconnected consumers', () => {
      const {
        consumer,
        contextValue,
        provider,
        providingValue,
      } = createContext();

      @provider
      class Provider extends HTMLElementMock {
        public [providingValue]: number = 2;
      }

      @consumer
      class Consumer extends HTMLElementMock {
        public [contextValue]: number;
      }

      const providerElement = new Provider();
      const consumerElement = new Consumer();

      consumerElement.addParent(providerElement);

      providerElement.connectedCallback();
      consumerElement.connectedCallback();

      consumerElement.disconnectedCallback();

      providerElement[providingValue] = 10;

      expect(consumerElement[contextValue]).toBe(2);
    });

    it('should throw an error if no provider exists for context', () => {
      const {
        consumer,
        contextValue,
      } = createContext();

      @consumer
      class Consumer extends HTMLElementMock {
        public [contextValue]: number;
      }

      const consumerElement = new Consumer();

      expect(() => {
        consumerElement.connectedCallback();
      }).toThrowError('No provider found for Consumer');
    });

    it('allows to not declare [providingValue] in the class constructor', () => {
      const {
        consumer,
        contextValue,
        provider,
        providingValue,
      } = createContext();

      @provider
      class Provider extends HTMLElementMock {
      }

      @consumer
      class Consumer extends HTMLElementMock {
        public [contextValue]: number;
      }

      const providerElement = new Provider();
      const consumerElement = new Consumer();

      consumerElement.addParent(providerElement);

      providerElement.connectedCallback();
      consumerElement.connectedCallback();

      (providerElement as any)[providingValue] = 10;

      expect(consumerElement[contextValue]).toBe(10);
    });
  });
});
