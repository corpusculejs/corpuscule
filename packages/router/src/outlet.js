import createContext from "@corpuscule/context";
import getSuperMethod from "@corpuscule/utils/lib/getSuperMethod";
import {
  resolving as $$resolving,
  updateRoute as $$updateRoute,
} from "./tokens/internal";
import {layout, resolve} from "./tokens/lifecycle";

const {
  consumer,
  contextValue,
  provider,
  providingValue: router,
} = createContext();

export {
  provider,
  router,
};

const connectedCallbackKey = "connectedCallback";
const disconnectedCallbackKey = "disconnectedCallback";

const outlet = routes => (classDescriptor) => {
  if (classDescriptor.kind !== "class") {
    throw new TypeError(`@outlet can be applied only to class, not to ${classDescriptor.kind}`);
  }

  const {elements, kind} = consumer(classDescriptor);

  const superConnectedCallback = getSuperMethod(connectedCallbackKey, elements);
  const superDisconnectedCallback = getSuperMethod(disconnectedCallbackKey, elements);

  return {
    elements: [...elements.filter(({key}) =>
      key !== connectedCallbackKey
      && key !== disconnectedCallbackKey
    ), {
      descriptor: {
        configurable: true,
        value() {
          window.addEventListener("popstate", this[$$updateRoute]);

          superConnectedCallback(this);

          this[$$updateRoute](location.pathname);
        },
      },
      key: connectedCallbackKey,
      kind: "method",
      placement: "prototype",
    }, {
      descriptor: {
        configurable: true,
        value() {
          window.removeEventListener("popstate", this[$$updateRoute]);
          superDisconnectedCallback(this);
        },
      },
      key: disconnectedCallbackKey,
      kind: "method",
      placement: "prototype",
    }, {
      descriptor: {
        get() {
          return this[$$resolving];
        },
      },
      key: "routeResolving",
      kind: "method",
      placement: "prototype",
    }, {
      descriptor: {
        configurable: true,
        *value(path) {
          return yield path;
        },
      },
      key: resolve,
      kind: "method",
      placement: "prototype",
    }, {
      descriptor: {},
      initializer() {
        return (pathOrEvent) => {
          const path = typeof pathOrEvent === "string"
            ? pathOrEvent
            : pathOrEvent.state || "";

          const iter = this[resolve](path);

          this[$$resolving] = this[contextValue].resolve(iter.next().value)
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
      },
      key: $$updateRoute,
      kind: "field",
      placement: "own",
    }],
    kind,
  };
};

export default outlet;
