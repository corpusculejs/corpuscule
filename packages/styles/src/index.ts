// tslint:disable:max-classes-per-file
import {StyleConstructor} from './types';

const stylePattern = /[{}]/;

const styles = (pathOrStyle: string) => <T extends StyleConstructor>(target: T): T => {
  if (stylePattern.test(pathOrStyle)) {
    return class WithStyle extends target {
      protected _createRoot(): HTMLDivElement {
        // @ts-ignore
        const root = super._createRoot();

        const style = document.createElement('style');
        style.textContent = pathOrStyle;

        const layout = document.createElement('div');
        root.appendChild(style);
        root.appendChild(layout);

        return layout;
      }
    };
  }

  return class WithLink extends target {
    private __loading?: Promise<void>;

    public async connectedCallback(): Promise<void> {
      await this.__loading;

      if (super.connectedCallback) {
        super.connectedCallback();
      }
    }

    protected _createRoot(): HTMLDivElement {
      // @ts-ignore
      const root = super._createRoot();

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = pathOrStyle;

      this.__loading = new Promise<void>((resolve) => {
        link.onload = resolve as any;
      });

      const layout = document.createElement('div');
      root.appendChild(link);
      root.appendChild(layout);

      return layout;
    }
  };
};

export default styles;
