// tslint:disable:max-classes-per-file
import {Constructor} from '../src/types';

export class BaseConsumer extends HTMLElement {
}

export class BaseProvider extends HTMLElement {
  public consumers?: ReadonlyArray<BaseConsumer>; // tslint:disable-line:readonly-keyword

  public constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  public connectedCallback(): void {
    if (this.consumers) {
      for (const consumer of this.consumers) {
        const div = document.createElement('div');
        div.appendChild(consumer);
        this.shadowRoot!.appendChild(div);
      }
    }
  }
}

export function registerAndMount<T extends BaseProvider, U extends BaseConsumer>(
  provider: [string, Constructor<T>],
  consumer: [string, Constructor<U>],
): [T, U];

export function registerAndMount<T extends BaseProvider, U1 extends BaseConsumer, U2 extends BaseConsumer>(
  provider: [string, Constructor<T>],
  consumer1: [string, Constructor<U1>],
  consumer2: [string, Constructor<U2>],
): [T, U1, U2];

export function registerAndMount<T extends BaseProvider>(
  [providerName, provider]: [string, Constructor<T>],
  ...consumers: Array<[string, Constructor<any>]> // tslint:disable-line:readonly-array
): ReadonlyArray<HTMLElement> {
  const list = new Array(consumers.length);
  customElements.define(providerName, provider);

  const p = document.createElement(providerName) as T;

  for (let i = 0; i < consumers.length; i++) { // tslint:disable-line:no-increment-decrement
    const [name, consumer] = consumers[i];
    customElements.define(name, consumer);
    list[i] = document.createElement(name);
  }

  p.consumers = list;

  document.body.appendChild(p);

  return [p, ...list];
}
