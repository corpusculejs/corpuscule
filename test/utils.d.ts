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

export class HTMLElementMock {
  public static readonly observedAttributes: ReadonlyArray<string>;
  public readonly attributes: ReadonlyMap<string, string>;
  public readonly listeners: ReadonlyMap<string, ReadonlyArray<(event: Event) => void>>;
  public readonly nestingChain: ReadonlyArray<HTMLElementMock>;
  public readonly shadowMock: HTMLDivElement;

  public readonly addEventListener: HTMLElement['addEventListener'];
  public readonly attachShadow: HTMLElement['attachShadow'];
  public readonly dispatchEvent: HTMLElement['dispatchEvent'];
  public readonly getAttribute: HTMLElement['getAttribute'];
  public readonly hasAttribute: HTMLElement['hasAttribute'];
  public readonly removeAttribute: HTMLElement['removeAttribute'];
  public readonly removeEventListener: HTMLElement['removeEventListener'];
  public readonly setAttribute: HTMLElement['setAttribute'];

  public addParent(parent: HTMLElementMock): void;

  public attributeChangedCallback(key: PropertyKey, oldValue: string | null, newValue: string | null): void;

  public connectedCallback(): void;

  public disconnectedCallback(): void;
}
