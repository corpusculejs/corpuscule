import createContext from "@corpuscule/context";
import {CustomElement, CustomElementClass, UncertainCustomElementClass} from "@corpuscule/types";
import UniversalRouter, {Options, Route} from "universal-router";

export const layout: unique symbol;

export const createRouter: (routes: Route | ReadonlyArray<Route>, options?: Options) => UniversalRouter;

export class Link extends HTMLAnchorElement implements CustomElement {
  public static readonly is: "corpuscule-link";

  public connectedCallback(): void;

  public disconnectedCallback(): void;
}

export const push: (path: string, title?: string) => void;

export const provider: ReturnType<typeof createContext>["provider"];
export const router: unique symbol;

export interface RouterOutlet<T> {
  readonly resolvingPromise: Promise<void>;
  readonly [layout]: T;
}

export const outlet:
  <T = any>(routes: ReadonlyArray<Route>) =>
    <U = {}>(target: UncertainCustomElementClass<U>) => CustomElementClass<U & RouterOutlet<T>>;
