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

const outlet = routes => (target) => {
  const consumed = consumer(target);

  const {
    connectedCallback,
    disconnectedCallback,
  } = consumed.prototype;

  Object.defineProperties(target.prototype, {
    connectedCallback: {
      configurable: true,
      value() {
        window.addEventListener("popstate", this[$$updateRoute]);

        if (connectedCallback) {
          connectedCallback.call(this);
        }

        this[$$updateRoute](location.pathname);
      },
    },
    disconnectedCallback: {
      configurable: true,
      value() {
        window.removeEventListener("popstate", this[$$updateRoute]);

        if (disconnectedCallback) {
          disconnectedCallback.call(this);
        }
      },
    },
    routeResolving: {
      get() {
        return this[$$resolving];
      },
    },
    // eslint-disable-next-line sort-keys
    [resolve]: {
      configurable: true,
      *value(path) {
        return yield path;
      },
    },
    // eslint-disable-next-line sort-keys
    [$$updateRoute]: {
      get() {
        const updateRoute = (pathOrEvent) => {
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
        };

        Object.defineProperty(this, $$updateRoute, {
          value: updateRoute,
        });

        return updateRoute;
      },
    },
  });

  return target;
};

export default outlet;
