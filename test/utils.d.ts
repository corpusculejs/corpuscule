export interface Constructor<T> {
  new (...args: any[]): T; // tslint:disable-line:readonly-array
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

  public attributeChangedCallback(
    key: PropertyKey,
    oldValue: string | null,
    newValue: string | null,
  ): void;

  public connectedCallback(): void;

  public disconnectedCallback(): void;
}

export const createTestingPromise: () => [Promise<void>, () => void];
