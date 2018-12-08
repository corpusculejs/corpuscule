// tslint:disable:max-classes-per-file
import styles, {link, style} from '../src';

describe('@corpuscule/styles', () => {
  const rawStyles = '.test{padding:10px}';
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('should create a <link> tag if path is received', () => {
    @styles('/styles.css')
    class Test extends HTMLElement {
      public static [style]: HTMLElement;
    }

    const {[style]: styleElement} = Test;
    container.appendChild(styleElement);

    expect(container.innerHTML).toBe('<link rel="stylesheet" type="text/css" href="/styles.css">');
  });

  it('should create a <style/> tag if styles are received', () => {
    @styles(rawStyles)
    class Test extends HTMLElement {
      public static [style]: HTMLElement;
    }

    const {[style]: styleElement} = Test;
    container.appendChild(styleElement);

    expect(container.innerHTML).toBe(`<style>${rawStyles}</style>`);
  });

  it('should allow to insert different style types', () => {
    @styles('/styles.css', rawStyles)
    class Test extends HTMLElement {
      public static [style]: HTMLElement;
    }

    const {[style]: styleElement} = Test;
    container.appendChild(styleElement);

    expect(container.innerHTML).toBe(
      `<link rel="stylesheet" type="text/css" href="/styles.css"><style>${rawStyles}</style>`,
    );
  });

  describe('link()', () => {
    it('should build url', () => {
      expect(link('./style.css', 'http://localhost/')).toBe('http://localhost/style.css');
    });
  });
});
