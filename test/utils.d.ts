// tslint:disable:max-classes-per-file

export interface Constructor<T> {
  new(...args: any[]): T; // tslint:disable-line:readonly-array
}

export const mount: <T>(element: Constructor<T> | string, beforeMount?: (element: T) => void) => T;
export const defineAndMount: <T>(element: Constructor<T>, beforeMount?: (element: T) => void) => T;

export const defineAndMountContext: {
  <T, U>(provider: Constructor<T>, consumer: Constructor<U>): [T, U];
  <T, U1, U2>(provider: Constructor<T>, consumer1: Constructor<U1>, consumer2: Constructor<U2>): [T, U1, U2];
};

export class BasicConsumer extends HTMLElement {}

export class BasicProvider extends HTMLElement {
  public readonly consumers?: DocumentFragment;

  public connectedCallback(): void;
}
