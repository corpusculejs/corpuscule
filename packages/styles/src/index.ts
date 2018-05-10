// tslint:disable:max-classes-per-file
import {StyleConstructor} from './types';

const stylePattern = /[{}]/;

const styles = (pathOrStyle: string) => <T extends StyleConstructor>(target: T): T => {
  const {
    _createRoot: superCreateRoot,
    connectedCallback: superConnectedCallback,
  } = target.prototype;

  if (stylePattern.test(pathOrStyle)) {
    target.prototype._createRoot = function _createRoot(this: any): HTMLDivElement {
      const root = superCreateRoot.call(this);

      const style = document.createElement('style');
      style.textContent = pathOrStyle;

      const layout = document.createElement('div');
      root.appendChild(style);
      root.appendChild(layout);

      return layout;
    };
  } else {
    target.prototype._createRoot = function _createRoot(this: any): HTMLDivElement {
      const root = superCreateRoot.call(this);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = pathOrStyle;

      this.__linkLoadingPromise = new Promise<void>((resolve) => {
        link.onload = resolve as any;
      });

      const layout = document.createElement('div');
      root.appendChild(link);
      root.appendChild(layout);

      return layout;
    };

    target.prototype.connectedCallback = async function connectedCallback(this: any): Promise<void> {
      await this.__linkLoadingPromise;

      if (superConnectedCallback) {
        superConnectedCallback.call(this);
      }
    };
  }

  return target;
};

export default styles;
