import CorpusculeElement, {createRoot} from "@corpuscule/element";
import {loading} from "./tokens";
import {Constructor} from "./types";

export {createUrl} from "./utils";

const stylePattern = /[{}]/;

// tslint:disable-next-line:readonly-array
const styles = (...pathsOrStyles: string[]) => <T extends Constructor<CorpusculeElement>>(target: T): T => {
  abstract class WithStyles extends target {
    private [loading]?: Promise<void[]>;

    public async connectedCallback(): Promise<void> {
      if (this[loading]) {
        await this[loading];
      }

      if (super.connectedCallback) {
        await super.connectedCallback();
      }
    }

    protected [createRoot](): HTMLDivElement {
      const root = super[createRoot]();
      const layout = document.createElement("div");
      const loadingProcesses: Array<Promise<void>> = [];

      for (const pathOrStyle of pathsOrStyles) {
        if (stylePattern.test(pathOrStyle)) {
          const style = document.createElement("style");
          style.textContent = pathOrStyle;
          root.appendChild(style);
        } else {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.type = "text/css";
          link.href = pathOrStyle;

          loadingProcesses.push(new Promise<void>((resolve) => {
            link.onload = resolve as any;
          }));

          root.appendChild(link);
        }
      }

      if (loadingProcesses.length > 0) {
        this[loading] = Promise.all(loadingProcesses);
      }

      root.appendChild(layout);

      return layout;
    }
  }

  return WithStyles;
};

export default styles;
