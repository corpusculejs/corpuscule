/**
 * This module provides a straightforward but comprehensive router solution for
 * web components via the [Universal Router](https://www.kriasoft.com/universal-router).
 *
 * @module @corpuscule/router
 */

/**
 * Do not remove this comment; it keeps typedoc from misplacing the module
 * docs.
 */

import {isProvider as isContextProvider} from '@corpuscule/context';
import {CustomElement} from '@corpuscule/typings';
import {Token} from '@corpuscule/utils/lib/tokenRegistry';
import UniversalRouter, {Context, Options, Route} from 'universal-router';

export interface RouterProviderOptions {
  /**
   * Defines the initial path of the router. By default it is equal to the
   * `location.pathname`.
   */
  readonly initialPath?: string;
}

/**
 * A function that creates an instance of the Universal Router. For the work
 * with the current module, it is essential to use this function instead of the
 * direct creation of the instance of the Universal Router because it adds
 * specific functionality to the Universal Router.
 *
 * @param routes a list of Universal Router routes.
 *
 * @param options a list of Universal Router options.
 *
 * @returns an instance of the [Universal Router](https://www.kriasoft.com/universal-router/api).
 */
export function createRouter<C extends Context = Context, R = any>(
  routes: Route | ReadonlyArray<Route<C, R>>,
  options?: Options<C, R>,
): UniversalRouter<C, R>;

/**
 * A customized `<a>` element that provides declarative navigation around the
 * application. It should be used for all internal links to make the router
 * working correctly.
 *
 * @noInheritDoc
 */
export class Link extends HTMLAnchorElement implements CustomElement {
  /**
   * A name of the element registered in the custom element registry.
   */
  public static readonly is: 'corpuscule-link';

  /**
   * A custom context data that will be send as a second parameter to the
   * [[navigate]] function.
   */
  public contextData: any;

  public connectedCallback(): void;

  public disconnectedCallback(): void;
}

/**
 * A function that navigates the browser to the new URL.
 *
 * @param path a new URL to navigate to.
 *
 * @param contextData some data you want to use in the route action. It will be
 * accessible as a part of the `context` parameter:
 * ```typescript
 * const route: Route<any, any> = {
 *   action({data}: RouteContext<any, any>) {
 *     // use `data` in some way
 *   }
 * }
 * ```
 */
export function navigate(path: string, contextData?: unknown): void;

/**
 * Creates tokens to bind decorators with each other.
 */
export function createRouterToken(): Token;

/**
 * A default version of the [@gearAdvanced]{@link @corpuscule/router.gearAdvanced}
 * with the token already provided.
 */
export const gear: PropertyDecorator;

/**
 * A default version of the [@isProviderAdvanced]{@link @corpuscule/router.isProviderAdvanced}
 * with the token already provided.
 */
export function isProvider(klass: unknown): boolean;

/**
 * A default version of the [@outletAdvanced]{@link @corpuscule/router.outletAdvanced}
 * with the token already provided.
 */
export function outlet(routes: ReadonlyArray<Route>): ClassDecorator;

/**
 * A default version of the [@providerAdvanced]{@link @corpuscule/router.providerAdvanced}
 * with the token already provided.
 */
export function provider(options?: RouterProviderOptions): ClassDecorator;

/**
 * A decorator that works similar to the [@value]{@link @corpuscule/context.value},
 * but with some specific features.
 *
 * ### [@provider]{@link @corpuscule/router.providerAdvanced}
 * Applied to a property of the class marked with the @provider decorator,
 * current decorator allows it to receive a router and send it to consumers.
 *
 * ### [@outlet]{@link @corpuscule/router.outletAdvanced}
 * Applied to a property of the class marked with the @outlet decorator, current
 * decorator allows it to receive result the route action returns.
 *
 * @param token a token issued by a [[createRouterToken]] function that connects
 * all decorators in a single working system.
 */
export function gearAdvanced(token: Token): PropertyDecorator;

/**
 * Works as a [isProvider]{@link @corpuscule/context.isProvider} for the
 * [@provider]{@link @corpuscule/router.providerAdvanced}.
 */
export const isProviderAdvanced: typeof isContextProvider;

/**
 * A decorator that makes a class a router outlet. The outlet is a central part
 * of the whole routing process because the content of the outlet depends on the
 * current route.
 *
 * The outlet class requires a property marked with the [@gear]{@link gearAdvanced}
 * decorator. This property will contain a content the current router provides.
 *
 * @param token a token issued by a [[createRouterToken]] function that connects
 * all decorators in a single working system.
 *
 * @param routes a list of routes the current outlet works with. You can use
 * both routes array that is sent to the [[createRouter]] function or one of the
 * nested children array.
 *
 * You can also put outlet elements one into another following the nested model
 * of the routes you use.
 *
 * ### Example
 * ```typescript
 * const routes = [
 *   {
 *     path: '/foo1',
 *     action: () => '<my-foo></my-foo>',
 *     children: [
 *       {
 *         path: '/bar1',
 *         action: () => '<div>Bar #1</div>',
 *       },
 *       {
 *         path: '/bar2',
 *         action: () => '<div>Bar #2</div>',
 *       },
 *     ]
 *   },
 *   {
 *     path: '/foo2',
 *     action: () => '<my-baz></my-baz>',
 *   },
 * ];
 *
 * @outlet(routes);
 * class App extends HTMLElement {
 *   @gear set result(value: string) {
 *     this.innerHTML = value;
 *   }
 * }
 *
 * customElements.define('my-app', App);
 *
 * @outlet(routes[0].children)
 * class Foo extends HTMLElement {
 *   @gear set result(value: string) {
 *     this.innerHTML = value;
 *   }
 * }
 *
 * customElements.define('my-foo', Foo);
 *
 * navigate('/foo1/bar2');
 * ```
 * The following HTML will be displayed:
 * ```html
 * <my-app>
 *   <my-foo>
 *     <div>Bar #2</div>
 *   </my-foo>
 * </my-app>
 * ```
 */
export function outletAdvanced<C extends Context = Context, R = any>(
  token: Token,
  routes: ReadonlyArray<Route<C, R>>,
): ClassDecorator;

/**
 * A decorator that creates a router provider. See [@provider]{@link @corpuscule/context.provider}
 * for more information.
 *
 * @param token a token issued by a [[createRouterToken]] function that connects
 * all decorators in a single working system.
 *
 * @param options a list of provider options.
 */
export function providerAdvanced(token: Token, options?: RouterProviderOptions): ClassDecorator;
