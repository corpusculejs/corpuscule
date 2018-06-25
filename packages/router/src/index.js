import createContext from "@corpuscule/context";
import {
  resolving as $$resolving,
  updateRoute as $$updateRoute,
} from "./tokens/internal";
import {layout, resolve} from "./tokens/lifecycle";

export {default as createUrl} from "universal-router/generateUrls";
export {default as createRouter} from "./createRouter";
export {default as Link} from "./Link";
export {default as push} from "./push";

const {
  consumer,
  contextValue: context,
  provider,
  providingValue: router,
} = createContext();

export {
  layout,
  provider,
  resolve,
  router,
};

export const outlet = routes => target =>
  class Route extends consumer(target) {
    constructor() {
      super();
      this[$$updateRoute] = this[$$updateRoute].bind(this);
    }

    connectedCallback() {
      window.addEventListener("popstate", this[$$updateRoute]);

      if (super.connectedCallback) {
        super.connectedCallback();
      }

      this[$$updateRoute](location.pathname);
    }

    disconnectedCallback() {
      window.removeEventListener("popstate", this[$$updateRoute]);

      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
    }

    get resolvingPromise() {
      return this[$$resolving];
    }

    // eslint-disable-next-line class-methods-use-this
    *[resolve](path) {
      return yield path;
    }

    [$$updateRoute](pathOrEvent) {
      const path = typeof pathOrEvent === "string"
        ? pathOrEvent
        : pathOrEvent.state || "";

      const iter = this[resolve](path);

      this[$$resolving] = this[context].resolve(iter.next().value)
        .then((resolved) => {
          if (resolved === undefined) {
            return;
          }

          const [result, {route}] = resolved;

          if (routes.includes(route)) {
            this[layout] = iter.next(result).value;
          }
        });
    }
  };
