// tslint:disable:max-classes-per-file no-inner-html await-promise
import {createTestingPromise, genName} from '../../../test/utils';
import styles, {stylesAttachedCallback} from '../src';

describe('@corpuscule/styles', () => {
  const rawStyles = '.foo{color: red;}';

  describe('file links', () => {
    it('appends "link" tags for urls with same origin', async () => {
      const [promise, resolve] = createTestingPromise();

      @styles(new URL('./styles.css', location.origin))
      class Test extends HTMLElement {
        public constructor() {
          super();
          this.attachShadow({mode: 'open'});
        }

        public connectedCallback(): void {
          this.shadowRoot!.innerHTML = '<div>Bar</div>';
        }

        public [stylesAttachedCallback](): void {
          resolve();
        }
      }

      customElements.define(genName(), Test);

      const test = new Test();
      test.connectedCallback();

      await promise;

      expect(test.shadowRoot!.innerHTML).toBe(
        `<link rel="stylesheet" type="text/css" href="/styles.css"><div>Bar</div>`,
      );
    });

    it('appends "link" tags for urls with different origins', async () => {
      const [promise, resolve] = createTestingPromise();

      @styles(new URL('./styles.css', 'https://foo'))
      class Test extends HTMLElement {
        public constructor() {
          super();
          this.attachShadow({mode: 'open'});
        }

        public connectedCallback(): void {
          this.shadowRoot!.innerHTML = '<div>Bar</div>';
        }

        public [stylesAttachedCallback](): void {
          resolve();
        }
      }

      customElements.define(genName(), Test);

      const test = new Test();
      test.connectedCallback();

      await promise;

      expect(test.shadowRoot!.innerHTML).toBe(
        `<link rel="stylesheet" type="text/css" href="https://foo/styles.css"><div>Bar</div>`,
      );
    });
  });

  it('appends raw styles to the shadow root', async () => {
    const [promise, resolve] = createTestingPromise();

    @styles(rawStyles)
    class Test extends HTMLElement {
      public constructor() {
        super();
        this.attachShadow({mode: 'open'});
      }

      public connectedCallback(): void {
        this.shadowRoot!.innerHTML = '<div class="foo">Bar</div>';
      }

      public [stylesAttachedCallback](): void {
        resolve();
      }
    }

    customElements.define(genName(), Test);

    const test = new Test();
    test.connectedCallback();

    await promise;

    expect(test.shadowRoot!.innerHTML).toBe(
      `<style>${rawStyles}</style><div class="foo">Bar</div>`,
    );
  });
});
