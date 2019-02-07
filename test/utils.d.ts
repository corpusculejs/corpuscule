export type Constructor<T> = new (...args: any[]) => T; // tslint:disable-line:readonly-array

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

export const createSimpleContext: <P extends Element, C extends Element>(
  Provider: Constructor<P>, // tslint:disable-line:naming-convention
  Consumer: Constructor<C>, // tslint:disable-line:naming-convention
) => Promise<[P, C]>;
