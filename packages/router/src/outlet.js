import createContext from "@corpuscule/context";
import {
  resolving as $$resolving,
  updateRoute as $$updateRoute,
} from "./tokens/internal";
import {layout, resolve} from "./tokens/lifecycle";

const {
  consumer,
  contextValue: context,
  provider,
  providingValue: router,
} = createContext();

export {
  provider,
  router,
};

const outlet = routes => target =>
  class Route extends consumer(target) {
    get resolvingPromise() {
      return this[$$resolving];
    }

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

export default outlet;
