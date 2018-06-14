export {default as createUrl} from "universal-router/generateUrls";
export {default as createRouter} from "./createRouter";
export {default as Link} from "./Link";
export {default as push} from "./push";

import createContext from "@corpuscule/context";
import * as $$ from "./tokens/internal";
import {layout} from "./tokens/lifecycle";

const {
  consumer,
  contextValue: context,
  provider,
  providingValue: router,
} = createContext();

export {
  layout,
  provider,
  router,
};

export const outlet = routes => target =>
  class Route extends consumer(target) {
    constructor() {
      super();
      this[$$.updateRoute] = this[$$.updateRoute].bind(this);
    }

    connectedCallback() {
      window.addEventListener("popstate", this[$$.updateRoute]);

      if (super.connectedCallback) {
        super.connectedCallback();
      }

      this[$$.updateRoute](location.pathname);
    }

    disconnectedCallback() {
      window.removeEventListener("popstate", this[$$.updateRoute]);

      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
    }

    get resolvingPromise() {
      return this[$$.resolving];
    }

    [$$.updateRoute](pathOrEvent) {
      const path = typeof pathOrEvent === "string"
        ? pathOrEvent
        : pathOrEvent.state || "";

      this[$$.resolving] = this[context].resolve(path)
        .then((resolved) => {
          if (resolved === undefined) {
            return;
          }

          const [result, {route}] = resolved;

          if (routes.includes(route)) {
            this[layout] = result;
          }
        });
    }
  };
