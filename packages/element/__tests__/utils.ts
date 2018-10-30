export interface ElementMock {
  attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
  connectedCallback(): void;
  disconnectedCallback(): void;
  setAttribute(name: string, )
}

export const mount = (element: ElementMock)

export const accessorDecorator = ({key}: any, _p: string): any => {
  const variable = new WeakMap<object, number>();

  return {
    descriptor: {
      get(this: object): number {
        return variable.get(this)!; // tslint:disable-line:no-invalid-this
      },
      set(this: object, value: number): void {
        variable.set(this, value); // tslint:disable-line:no-invalid-this
      },
    },
    key,
    kind: "method",
    placement: "prototype",
  };
};
