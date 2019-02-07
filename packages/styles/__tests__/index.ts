// tslint:disable:max-classes-per-file no-inner-html await-promise
import {defineCE, fixtureSync} from '@open-wc/testing-helpers';
import {Constructor, createTestingPromise} from '../../../test/utils';
import {createStylesDecorator, stylesAttachedCallback, StylesDecorator} from '../src';

const createSimpleElement = <T extends Element>(cls: Constructor<T>): T => {
  const tag = defineCE(cls);

  return fixtureSync(`<${tag}></${tag}>`) as any;
};

describe('@corpuscule/styles', () => {
  const rawStyles = '.foo{color: red;}';
  let styles: StylesDecorator;

  describe('file links', () => {
    beforeEach(() => {
      styles = createStylesDecorator({adoptedStyleSheets: false, shadyCSS: false});
    });

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

      const test = createSimpleElement(Test);

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

      const test = createSimpleElement(Test);

      await promise;

      expect(test.shadowRoot!.innerHTML).toBe(
        `<link rel="stylesheet" type="text/css" href="https://foo/styles.css"><div>Bar</div>`,
      );
    });
  });

  describe('Constructable Style Sheets', () => {
    let sheetSpyObj: jasmine.SpyObj<{replaceSync: (styles: string) => void}>;
    let sheetSpy: jasmine.Spy;
    let adoptedStyleSheets: jasmine.Spy;

    beforeEach(() => {
      styles = createStylesDecorator({adoptedStyleSheets: true, shadyCSS: false});
      sheetSpyObj = jasmine.createSpyObj('CSSStyleSheet', ['replaceSync']);
      sheetSpy = spyOn(window as any, 'CSSStyleSheet').and.returnValue(sheetSpyObj);

      adoptedStyleSheets = jasmine.createSpy('adoptedStyleSheets');

      Object.defineProperty((window as any).ShadowRoot.prototype, 'adoptedStyleSheets', {
        configurable: true,
        enumerable: true,
        set: adoptedStyleSheets,
      });
    });

    afterEach(() => {
      sheetSpy.and.callThrough();
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

      expect(sheetSpy).toHaveBeenCalled();
      expect(sheetSpyObj.replaceSync).toHaveBeenCalledWith(rawStyles);
      expect(adoptedStyleSheets).toHaveBeenCalledWith([sheetSpyObj]);
    });
  });

  describe('ShadyCSS', () => {
    beforeEach(() => {
      styles = createStylesDecorator({adoptedStyleSheets: false, shadyCSS: true});
      (window as any).ShadyCSS = jasmine.createSpyObj('ShadyCSS', ['prepareAdoptedCssText']);
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

      expect((window as any).ShadyCSS.prepareAdoptedCssText).toHaveBeenCalledWith(
        [rawStyles],
        test.localName,
      );
    });
  });

  it('appends raw styles to the shadow root', async () => {
    styles = createStylesDecorator({adoptedStyleSheets: false, shadyCSS: false});

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

    expect(test.shadowRoot!.innerHTML).toBe(`<style>${rawStyles}</style><div>Bar</div>`);
  });

  it('does not throw an error if class already have own lifecycle element', () => {
    styles = createStylesDecorator({adoptedStyleSheets: false, shadyCSS: false});

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
