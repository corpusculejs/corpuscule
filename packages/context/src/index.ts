// tslint:disable:max-classes-per-file
import * as $$ from './tokens/internal';
import {value} from './tokens/lifecycle';
import {
  Constructor,
  Consume,
  ContextDetails,
  CustomElement,
  Unsubscribe,
} from './types';

export {value};

const crypto = window.crypto || (window as any).msCrypto;

const randomString = () => {
  const arr = new Uint32Array(2);
  const [rnd1, rnd2] = crypto.getRandomValues(arr) as Uint32Array;

  return `${rnd1}${rnd2}`;
};

const createContext = <T>(defaultValue?: T) => {
  const eventName = randomString();

  const provider = <U extends Constructor<CustomElement>>(target: U): U =>
    class Provider extends target {
      private [$$.consumers]: Array<Consume<T>> = []; // tslint:disable-line:readonly-array
      private [$$.value]?: T = this[$$.value] !== undefined
        ? this[$$.value]
        : defaultValue;

      public get [value](): T | undefined {
        return this[$$.value];
      }

      public set [value](v: T | undefined) {
        this[$$.value] = v;

        if (this[$$.consumers]) {
          for (const cb of this[$$.consumers]) {
            cb(v);
          }
        }
      }

      public connectedCallback(): void {
        this.addEventListener(eventName, this[$$.subscribe]);

        if (super.connectedCallback) {
          super.connectedCallback();
        }
      }

      public disconnectedCallback(): void {
        this.removeEventListener(eventName, this[$$.subscribe]);

        if (super.disconnectedCallback) {
          super.disconnectedCallback();
        }
      }

      private [$$.subscribe] = (event: CustomEvent<ContextDetails<T>>): void => {
        const {consume} = event.detail;
        this[$$.consumers].push(consume);
        consume(this[$$.value]);
        event.detail.unsubscribe = this[$$.unsubscribe];
        event.stopPropagation();
      };

      private [$$.unsubscribe]: Unsubscribe<T> = (consume) => {
        this[$$.consumers] = this[$$.consumers].filter(p => p !== consume);
      };
    };

  const consumer = <U extends Constructor<CustomElement>>(target: U): U =>
    class Consumer extends target {
      protected [value]?: T;
      private [$$.unsubscribe]?: Unsubscribe<T>;

      public connectedCallback(): void {
        const event = new CustomEvent<ContextDetails<T>>(eventName, {
          bubbles: true,
          cancelable: true,
          // @ts-ignore
          composed: true, // TODO: remove quickfix when typescript adds "composed" to typings
          detail: {
            consume: this[$$.consume],
          },
        });

        this.dispatchEvent(event);

        this[$$.unsubscribe] = event.detail.unsubscribe;

        if (super.connectedCallback) {
          super.connectedCallback();
        }
      }

      public disconnectedCallback(): void {
        if (this[$$.unsubscribe]) {
          // TODO: remove quickfix when typescript fixes issue with symbolic fields
          this[$$.unsubscribe]!(this[$$.consume]);
        }

        if (super.disconnectedCallback) {
          super.disconnectedCallback();
        }
      }

      private readonly [$$.consume]: Consume<T> = (v) => {
        this[value] = v;
      };
    };

  return {
    consumer,
    provider,
  };
};

export default createContext;
