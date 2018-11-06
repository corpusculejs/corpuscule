export class HTMLElementMock {
  public static readonly observedAttributes?: ReadonlyArray<string>;
  public readonly attributes: Map<string, string> = new Map();
  public readonly shadowMock: HTMLDivElement = document.createElement('div');

  public attachShadow(): unknown {
    return this.shadowMock;
  }

  public attributeChangedCallback(
    _key: PropertyKey,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {} // tslint:disable-line:no-empty

  // tslint:disable-next-line:no-empty
  public connectedCallback(): void {}

  public getAttribute(key: string): string | null {
    return this.attributes.has(key)
      ? this.attributes.get(key)!
      : null;
  }

  public hasAttribute(key: string): boolean {
    return this.attributes.has(key);
  }

  public removeAttribute(key: string): void {
    this.attributes.delete(key);
  }

  public setAttribute(key: string, value: unknown): void {
    const v = String(value);
    this.attributeChangedCallback(
      key,
      this.attributes.has(key)
        ? this.attributes.get(key)!
        : null,
      v,
    );
    this.attributes.set(key, v);
  }
}
