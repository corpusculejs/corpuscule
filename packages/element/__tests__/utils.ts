import {Constructor, createTestingPromise} from '../../../test/utils';

export const fixtureMixin = <T extends Constructor<Element>>(base: T) =>
  class extends base {
    public updateComplete: Promise<void>; // tslint:disable-line:prefer-readonly
    private resolve: () => void; // tslint:disable-line:prefer-readonly

    public constructor(...args: any[]) {
      super(...args);
      [this.updateComplete, this.resolve] = createTestingPromise();
    }

    public connectedCallback(): void {
      this.resolve();
      [this.updateComplete, this.resolve] = createTestingPromise();
    }

    public updatedCallback(): void {
      this.resolve();
      [this.updateComplete, this.resolve] = createTestingPromise();
    }
  };
