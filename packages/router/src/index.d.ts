import createContext from '@corpuscule/context';
import {CustomElement} from '@corpuscule/typings';
import UniversalRouter, {Options, Route} from 'universal-router';

export const layout: unique symbol;
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

export type OutletDecorator = (routes: ReadonlyArray<Route>) => ClassDecorator;

export const api: PropertyDecorator;
export const outlet: OutletDecorator;
export const provider: ClassDecorator;

export interface RouterContext {
  readonly api: PropertyDecorator;
  readonly outlet: OutletDecorator;
  readonly provider: ClassDecorator;
}

export const createRouterContext: () => RouterContext;
