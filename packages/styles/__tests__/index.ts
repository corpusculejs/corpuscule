// tslint:disable:max-classes-per-file no-inner-html await-promise
import {defineCE, fixtureSync} from '@open-wc/testing-helpers';
import {Constructor, createTestingPromise} from '../../../test/utils';
import defaultStyles, {stylesAdvanced, stylesAttachedCallback} from '../src';

const createSimpleElement = <T extends Element>(cls: Constructor<T>): T => {
  const tag = defineCE(cls);

  return fixtureSync<T>(`<${tag}></${tag}>`);
};

describe('@corpuscule/styles', () => {
  const rawStyles = '.foo{color: red;}';
  let styles: typeof defaultStyles;

  beforeEach(() => {
    styles = (...pathsOrStyles) =>
      stylesAdvanced(pathsOrStyles, {
        adoptedStyleSheets: false,
        shadyCSS: false,
      });
  });

  describe('file links', () => {
    it('appends "link" tags for urls with same origin', async () => {
      const [promise, resolve] = createTestingPromise();

      @styles(new URL('assets/styles/basic.css', location.origin))
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

      const test = createSimpleElement(Test);

      await promise;

      expect(test.shadowRoot!.innerHTML).toBe(
        '<link rel="stylesheet" type="text/css" href="/assets/styles/basic.css">' +
          '<div class="foo">Bar</div>',
      );
    });
  });

  describe('Constructable Style Sheets', () => {
    let replaceSyncSpy: jasmine.Spy;
    let adoptedStyleSheetsSpy: jasmine.Spy;

    beforeEach(() => {
      // TODO: remove after https://github.com/calebdwilliams/construct-style-sheets/pull/35
      // is merged
      if (!('adoptedStyleSheets' in document)) {
        pending();
      }

      styles = (...pathsOrStyles) =>
        stylesAdvanced(pathsOrStyles, {
          adoptedStyleSheets: true,
          shadyCSS: false,
        });
      replaceSyncSpy = spyOn(CSSStyleSheet.prototype as any, 'replaceSync');

      adoptedStyleSheetsSpy = jasmine.createSpy('adoptedStyleSheets');

      Object.defineProperty(
        (window as any).ShadowRoot.prototype,
        'adoptedStyleSheets',
        {
          configurable: true,
          enumerable: true,
          set: adoptedStyleSheetsSpy,
        },
      );
    });

    afterEach(() => {
      replaceSyncSpy.and.callThrough();
    });

    it('properly appends constructed style sheet', async () => {
      const [promise, resolve] = createTestingPromise();

      @styles(rawStyles)
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

      createSimpleElement(Test);

      await promise;

      expect(replaceSyncSpy).toHaveBeenCalledWith(rawStyles);
      expect(adoptedStyleSheetsSpy).toHaveBeenCalledWith([jasmine.any(Object)]);

      const [
        [constructedStyleSheet],
      ] = adoptedStyleSheetsSpy.calls.mostRecent().args;
      expect(constructedStyleSheet instanceof CSSStyleSheet).toBeTruthy();
    });

    it('appends existing stylesheet', async () => {
      const [promise, resolve] = createTestingPromise();

      const constructedStyleSheet = new CSSStyleSheet();

      @styles(constructedStyleSheet)
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

      createSimpleElement(Test);

      await promise;

      expect(adoptedStyleSheetsSpy).toHaveBeenCalledWith([
        constructedStyleSheet,
      ]);
    });
  });

  describe('ShadyCSS', () => {
    beforeEach(() => {
      styles = (...pathsOrStyles) =>
        stylesAdvanced(pathsOrStyles, {
          adoptedStyleSheets: false,
          shadyCSS: true,
        });
      (window as any).ShadyCSS = jasmine.createSpyObj('ShadyCSS', [
        'prepareAdoptedCssText',
      ]);
    });

    it('properly appends constructed style sheet', async () => {
      const [promise, resolve] = createTestingPromise();

      @styles(rawStyles)
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

      const test = createSimpleElement(Test);

      await promise;

      expect(
        (window as any).ShadyCSS.prepareAdoptedCssText,
      ).toHaveBeenCalledWith([rawStyles], test.localName);
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
        this.shadowRoot!.innerHTML = '<div>Bar</div>';
      }

      public [stylesAttachedCallback](): void {
        resolve();
      }
    }

    const test = createSimpleElement(Test);

    await promise;

    expect(test.shadowRoot!.innerHTML).toBe(
      `<style>${rawStyles}</style><div>Bar</div>`,
    );
  });

  it('does not throw an error if class already have own lifecycle element', () => {
    expect(() => {
      @styles('')
      class Test extends HTMLElement {
        public constructor() {
          super();
          this.attachShadow = this.attachShadow.bind(this);
        }
      }

      defineCE(Test);
    }).not.toThrow();
  });
});
