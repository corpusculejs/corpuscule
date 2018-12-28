// tslint:disable:max-classes-per-file no-inner-html await-promise
import {createTestingPromise, genName} from '../../../test/utils';
import styles, {stylesAttachedCallback} from '../src';

describe('@corpuscule/styles', () => {
  const rawStyles = '.foo{color: red;}';

  it('appends styles to the shadow root', async () => {
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
