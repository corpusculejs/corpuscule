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

export const route = routes => target =>
  class Route extends consumer(target) {
    constructor() {
      super();
      this[$$.updateRoute] = this[$$.updateRoute].bind(this);
    }

    async connectedCallback() {
      window.addEventListener("popstate", this[$$.updateRoute]);

      if (super.connectedCallback) {
        super.connectedCallback();
      }

      await this[$$.updateRoute](location.pathname);
    }

    disconnectedCallback() {
      window.removeEventListener("popstate", this[$$.updateRoute]);

      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
    }

    async [$$.updateRoute](pathOrEvent) {
      const path = typeof pathOrEvent === "string"
        ? pathOrEvent
        : (pathOrEvent.state ? pathOrEvent.state.path : ""); // eslint-disable-line no-extra-parens

      const resolved = await this[context].resolve(path);

      if (resolved === undefined) {
        return;
      }

      const [result, routeCtx] = resolved;

      if (routes.includes(routeCtx.route)) {
        this[layout] = result;
      }
    }
  };
