import {CustomElement} from '@corpuscule/typings';
import {Token, TokenCreator} from '@corpuscule/utils/lib/tokenRegistry';
import UniversalRouter, {Options, Route} from 'universal-router';

export {isProvider as isProviderAdvanced} from '@corpuscule/context';

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

export function navigate(path: string, title?: string): void;

export const createRouterToken: TokenCreator;

export interface RouterProviderOptions {
  readonly initial?: string;
}

export const gear: PropertyDecorator;
export const isProvider: (klass: unknown) => boolean;
export const outlet: (routes: ReadonlyArray<Route>) => ClassDecorator;
export const provider: (options?: RouterProviderOptions) => ClassDecorator;

export const gearAdvanced: (token: Token) => PropertyDecorator;
export const outletAdvanced: (token: Token, routes: ReadonlyArray<Route>) => ClassDecorator;
export const providerAdvanced: (token: Token, options?: RouterProviderOptions) => ClassDecorator;
