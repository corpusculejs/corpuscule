// tslint:disable:max-classes-per-file
import {render, TemplateResult} from 'lit-html';
import styles, {link, style} from '../src';

describe('@corpuscule/styles', () => {
  const commentPattern = /<!--[\s\S]*?-->/g;
  const rawStyles = '.test{padding:10px}';

  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = ''; // tslint:disable-line:no-inner-html
  });

  it('should create a <link> tag if path is received', () => {
    @styles('/styles.css')
    class Test extends HTMLElement {
      public static [style]: TemplateResult;
    }

    const {[style]: s} = Test;

    expect(s).toEqual(jasmine.any(TemplateResult));

    render(s, container);

    expect(container.innerHTML.replace(commentPattern, '')).toBe(
      '<link rel="stylesheet" type="text/css" href="/styles.css">',
    );
  });

  it('should create a <style/> tag if styles are received', () => {
    @styles(rawStyles)
    class Test extends HTMLElement {
      public static [style]: TemplateResult;
    }

    const {[style]: s} = Test;

    expect(s).toEqual(jasmine.any(TemplateResult));

    render(s, container);

    expect(container.innerHTML.replace(commentPattern, '')).toBe(`<style>${rawStyles}</style>`);
  });

  it('should allow to insert different style types', () => {
    @styles('/styles.css', rawStyles)
    class Test extends HTMLElement {
      public static [style]: TemplateResult;
    }

    const {[style]: s} = Test;

    expect(s).toEqual(jasmine.any(TemplateResult));

    render(s, container);

    expect(container.innerHTML.replace(commentPattern, '')).toBe(
      `<link rel="stylesheet" type="text/css" href="/styles.css"><style>${rawStyles}</style>`,
    );
  });

  describe('link()', () => {
    it('should build url', () => {
      expect(link('./style.css', 'http://localhost/')).toBe('http://localhost/style.css');
    });
  });
});
