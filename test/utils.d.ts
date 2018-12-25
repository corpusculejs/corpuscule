export interface Constructor<T> {
  new (...args: any[]): T; // tslint:disable-line:readonly-array
}

export class CustomElement extends HTMLElement {
  public attributeChangedCallback(
    key: PropertyKey,
    oldValue: string | null,
    newValue: string | null,
  ): void;

  public connectedCallback(): void;

  public disconnectedCallback(): void;
}

export const genName: () => string;

export const createTestingPromise: () => [Promise<void>, () => void];
