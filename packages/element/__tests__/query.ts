import {defineCE, fixture} from '@open-wc/testing-helpers';
import {query, queryAll} from '../src';

describe('@corpuscule/element', () => {
  describe('@query', () => {
    it('finds element in shadow root', async () => {
      class Test extends HTMLElement {
        @query('#target')
        public target!: HTMLElement;

        public constructor() {
          super();

          this.attachShadow({mode: 'open'});
        }

        public connectedCallback(): void {
          // tslint:disable-next-line:no-inner-html
          this.shadowRoot!.innerHTML = `
            <div></div>
            <div class="wrapper">
              <div id="target">Test text</div>
            </div>
          `;
        }
      }

      const tag = defineCE(Test);
      const test = await fixture<Test>(`<${tag}></${tag}>`);

      expect(test.target).toEqual(jasmine.any(HTMLElement));
      expect(test.target.textContent).toBe('Test text');
    });

    it('finds element in lightDOM', async () => {
      class Test extends HTMLElement {
        @query('#target')
        public target!: HTMLElement;

        public connectedCallback(): void {
          // tslint:disable-next-line:no-inner-html
          this.innerHTML = `
            <div></div>
            <div class="wrapper">
              <div id="target">Test text</div>
            </div>
          `;
        }
      }

      const tag = defineCE(Test);
      const test = await fixture<Test>(`<${tag}></${tag}>`);

      expect(test.target).toEqual(jasmine.any(HTMLElement));
      expect(test.target.textContent).toBe('Test text');
    });

    it('can work in the light DOM even if Shadow DOM is enabled', async () => {
      class Test extends HTMLElement {
        @query('#target', {lightDOM: true})
        public target!: HTMLElement;

        public constructor() {
          super();

          this.attachShadow({mode: 'open'});
        }

        public connectedCallback(): void {
          // tslint:disable-next-line:no-inner-html
          this.innerHTML = `
            <div></div>
            <div class="wrapper">
              <div id="target">Test text</div>
            </div>
          `;

          // tslint:disable-next-line:no-inner-html
          this.shadowRoot!.innerHTML = `<div id="target">Another text</div>`;
        }
      }

      const tag = defineCE(Test);
      const test = await fixture<Test>(`<${tag}></${tag}>`);

      expect(test.target).toEqual(jasmine.any(HTMLElement));
      expect(test.target.textContent).toBe('Test text');
    });
  });

  describe('@queryAll', () => {
    it('finds all elements in shadow root', async () => {
      class Test extends HTMLElement {
        @queryAll('.target')
        public targets!: NodeList;

        public constructor() {
          super();

          this.attachShadow({mode: 'open'});
        }

        public connectedCallback(): void {
          // tslint:disable-next-line:no-inner-html
          this.shadowRoot!.innerHTML = `
            <div></div>
            <div class="wrapper">
              <div class="target">Test 1</div>
              <div class="target">Test 2</div>
              <div class="target">Test 3</div>
            </div>
          `;
        }
      }

      const tag = defineCE(Test);
      const test = await fixture<Test>(`<${tag}></${tag}>`);

      expect(test.targets).toEqual(jasmine.any(NodeList));
      expect(test.targets.length).toBe(3);
      expect(test.targets[0].textContent).toBe('Test 1');
      expect(test.targets[1].textContent).toBe('Test 2');
      expect(test.targets[2].textContent).toBe('Test 3');
    });

    it('finds all elements in light DOM', async () => {
      class Test extends HTMLElement {
        @queryAll('.target')
        public targets!: NodeList;

        public connectedCallback(): void {
          // tslint:disable-next-line:no-inner-html
          this.innerHTML = `
            <div></div>
            <div class="wrapper">
              <div class="target">Test 1</div>
              <div class="target">Test 2</div>
              <div class="target">Test 3</div>
            </div>
          `;
        }
      }

      const tag = defineCE(Test);
      const test = await fixture<Test>(`<${tag}></${tag}>`);

      expect(test.targets).toEqual(jasmine.any(NodeList));
      expect(test.targets.length).toBe(3);
      expect(test.targets[0].textContent).toBe('Test 1');
      expect(test.targets[1].textContent).toBe('Test 2');
      expect(test.targets[2].textContent).toBe('Test 3');
    });

    it('can work with lightDOM even if ShadowDOM is enabled', async () => {
      class Test extends HTMLElement {
        @queryAll('.target', {lightDOM: true})
        public targets!: NodeList;

        public constructor() {
          super();

          this.attachShadow({mode: 'open'});
        }

        public connectedCallback(): void {
          // tslint:disable-next-line:no-inner-html
          this.innerHTML = `
            <div></div>
            <div class="wrapper">
              <div class="target">Test 1</div>
              <div class="target">Test 2</div>
              <div class="target">Test 3</div>
            </div>
          `;
        }
      }

      const tag = defineCE(Test);
      const test = await fixture<Test>(`<${tag}></${tag}>`);

      expect(test.targets).toEqual(jasmine.any(NodeList));
      expect(test.targets.length).toBe(3);
      expect(test.targets[0].textContent).toBe('Test 1');
      expect(test.targets[1].textContent).toBe('Test 2');
      expect(test.targets[2].textContent).toBe('Test 3');
    });
  });
});
