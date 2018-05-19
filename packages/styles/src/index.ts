// tslint:disable:max-classes-per-file
import {StyleConstructor} from './types';

const stylePattern = /[{}]/;

// tslint:disable-next-line:readonly-array
const styles = (...pathsOrStyles: string[]) => <T extends StyleConstructor>(target: T): T =>
  class WithStyles extends target {
    private __loading?: Promise<void[]>;

    public async connectedCallback(): Promise<void> {
      if (this.__loading) {
        await this.__loading;
      }

      if (super.connectedCallback) {
        super.connectedCallback();
      }
    }

    protected _createRoot(): HTMLDivElement {
      // @ts-ignore
      const root = super._createRoot();
      const layout = document.createElement('div');
      const loadingPromises: Array<Promise<void>> = [];

      for (const pathOrStyle of pathsOrStyles) {
        if (stylePattern.test(pathOrStyle)) {
          const style = document.createElement('style');
          style.textContent = pathOrStyle;
          root.appendChild(style);
        } else {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = 'text/css';
          link.href = pathOrStyle;

          loadingPromises.push(new Promise<void>((resolve) => {
            link.onload = resolve as any;
          }));

          root.appendChild(link);
        }
      }

      if (loadingPromises.length > 0) {
        this.__loading = Promise.all(loadingPromises);
      }

      root.appendChild(layout);

      return layout;
    }
  };

export default styles;
