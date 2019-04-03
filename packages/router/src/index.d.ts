import {CustomElement} from '@corpuscule/typings';
import {Token, TokenCreator} from '@corpuscule/utils/lib/tokenRegistry';
import UniversalRouter, {Options, Route} from 'universal-router';

export {isProvider as isProviderAdvanced, provider as providerAdvanced} from '@corpuscule/context';

export const resolve: unique symbol;

export const createRouter: (
  routes: Route | ReadonlyArray<Route>,
  options?: Options,
) => UniversalRouter;

export class Link extends HTMLAnchorElement implements CustomElement {
  public static readonly is: 'corpuscule-link';

  public connectedCallback(): void;

  public disconnectedCallback(): void;
}

export const push: (path: string, title?: string) => void;

export const createRouterToken: TokenCreator;

export const api: PropertyDecorator;
export const isProvider: (target: unknown) => boolean;
export const outlet: (routes: ReadonlyArray<Route>) => ClassDecorator;
export const provider: ClassDecorator;

export const apiAdvanced: (token: Token) => PropertyDecorator;
export const outletAdvanced: (token: Token, routes: ReadonlyArray<Route>) => ClassDecorator;
