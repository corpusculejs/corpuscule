import UniversalRouter, {Options, Route} from 'universal-router';
import generate from 'universal-router/generateUrls';
import {
  CreateLinkElementAndUrlConstructor,
  CustomElementBase,
  LocationDescriptor,
  RouteDataDecorator, RouterDecorator, RouterPush,
} from './types';

const createRouterMixin = (
  routes: Route | ReadonlyArray<Route>,
  options?: Options,
): [
  RouterDecorator,
  RouterPush,
  RouteDataDecorator,
  CreateLinkElementAndUrlConstructor
] => {
  const routeDataMap = new WeakMap<any, string>();
  const router = new UniversalRouter(routes as Route | Route[], options);

  const push: RouterPush = (path, title = ''): void => {
    history.pushState({path}, title, path);
    dispatchEvent(new PopStateEvent('popstate', {state: history.state}));
  };

  const RouteData: RouteDataDecorator = (target, propertyName) => {
    if (routeDataMap.has(target)) {
      throw new Error('Router cannot have multiple route data fields');
    }

    routeDataMap.set(target, propertyName);
  };

  async function updateRoute(this: any, e: PopStateEvent | string): Promise<void> {
    const propertyName = routeDataMap.get(this.constructor.prototype)!;
    (this as any)[propertyName] = await router.resolve(
      typeof e === 'string'
        ? e
        : (
          e.state
            ? e.state.path
            : ''
        )
    );
  }

  const Router: RouterDecorator = target => {
    const routeUpdaters = new WeakMap<any, (e: PopStateEvent) => Promise<void>>();

    const {
      connectedCallback: superConnectedCallback,
      disconnectedCallback: superDisconnectedCallback,
    } = target.prototype;

    target.prototype.connectedCallback = async function connectedCallback(this: any): Promise<void> {
      const boundRouteUpdater = updateRoute.bind(this);
      routeUpdaters.set(this, boundRouteUpdater);

      if (routeDataMap.has(this.constructor.prototype)) {
        window.addEventListener('popstate', boundRouteUpdater);
      }

      if (superConnectedCallback) {
        superConnectedCallback.call(this);
      }

      await updateRoute.call(this, location.pathname);
    };

    target.prototype.disconnectedCallback = function disconnectedCallback(this: any): void {
      window.removeEventListener('popstate', routeUpdaters.get(this)!);

      if (superDisconnectedCallback) {
        superDisconnectedCallback.call(this);
      }
    }
  };

  const createLinkElementAndUrlConstructor: CreateLinkElementAndUrlConstructor =
    (name, opts) => {
      const createUrl = generate(router, opts);

      class Link extends HTMLElement implements CustomElementBase {
        public static readonly is: string = name;
        public static readonly observedAttributes: ReadonlyArray<string> = ['to'];

        private __a: HTMLAnchorElement = document.createElement('a');
        private __to: string = '';

        public constructor() {
          super();
          const root = this.attachShadow({mode: 'open'});
          root.appendChild(this.__a);
          this.__a.appendChild(document.createElement('slot'));
        }

        public attributeChangedCallback(_attrName: string, oldVal: string, newVal: string): void {
          if (oldVal !== newVal) {
            this.__to = newVal;
            this.__a.href = this.__to;
          }
        }

        public connectedCallback(): void {
          this.__to = this.getAttribute('to') || '';
          this.__a.href = this.__to;
          this.__a.addEventListener('click', this.__handleClick);
        }

        public disconnectedCallback(): void {
          this.__a.removeEventListener('click', this.__handleClick);
        }

        public get to(): string | LocationDescriptor {
          return this.__to;
        }

        public set to(value: string | LocationDescriptor) {
          this.__to = typeof value === 'string'
            ? value
            : createUrl(value.routeName, value.params);
          this.setAttribute('to', this.__to);
        }

        private __handleClick = (e: Event) => {
          e.preventDefault();
          push(this.__to);
        }
      }

      customElements.define(name, Link);

      return [Link, createUrl];
    };

  return [Router, push, RouteData, createLinkElementAndUrlConstructor];
};

export default createRouterMixin;
