// tslint:disable:max-classes-per-file no-inner-html await-promise
import {genName} from '../../../test/utils';
import styles from '../src';

describe('@corpuscule/styles', () => {
  const rawStyles = '.foo{color: red;}';

  it('appends styles to the shadow root', async () => {
    @styles(rawStyles)
    class Test extends HTMLElement {
      public constructor() {
        super();
        this.attachShadow({mode: 'open'});
      }

      public connectedCallback(): void {
        this.shadowRoot!.innerHTML = '<div class="foo">Bar</div>';
      }
    }

    customElements.define(genName(), Test);

    const test = new Test();
    test.connectedCallback();

    await null;

    expect(test.shadowRoot!.innerHTML).toBe(
      `<div class="foo">Bar</div><style>${rawStyles}</style>`,
    );
  });
});
